#!/usr/bin/env bash
# Dumps the production MongoDB database, encrypts it and uploads it to Backblaze B2 (S3-compatible
# API), then prunes old copies. Run nightly by .github/workflows/db-backup.yml; restores are tested
# monthly on GitHub's servers by .github/workflows/db-restore-test.yml. See docs/BACKUP.md.
#
# Required env:
#   MONGO_BACKUP_URI      connection string of a READ-ONLY Atlas user
#   BACKUP_PASSPHRASE     encryption passphrase (keep a copy outside GitHub, or backups are unreadable)
#   B2_BUCKET, B2_ENDPOINT (e.g. https://s3.us-west-004.backblazeb2.com)
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY   the B2 application key id / key
# Optional env:
#   MONGO_DB_NAME (default: test), KEEP_DAILY (7), KEEP_WEEKLY (4), KEEP_MONTHLY (3)
set -euo pipefail

: "${MONGO_BACKUP_URI:?MONGO_BACKUP_URI is not set}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE is not set}"
: "${B2_BUCKET:?B2_BUCKET is not set}"
: "${B2_ENDPOINT:?B2_ENDPOINT is not set}"

DB="${MONGO_DB_NAME:-test}"
KEEP_DAILY="${KEEP_DAILY:-7}"
KEEP_WEEKLY="${KEEP_WEEKLY:-4}"
KEEP_MONTHLY="${KEEP_MONTHLY:-3}"

# B2's S3 API does not accept the AWS CLI's newer default checksum headers.
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
# The region is part of the B2 endpoint host: s3.<region>.backblazeb2.com
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-$(echo "$B2_ENDPOINT" | sed -E 's#https?://s3\.([^.]+)\..*#\1#')}"

s3() { aws --endpoint-url "$B2_ENDPOINT" "$@"; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
STAMP="$(date -u +%Y-%m-%dT%H%MZ)"
NAME="cog-${DB}-${STAMP}.archive.gz.enc"

echo "==> Dumping database '$DB'"
mongodump --uri="$MONGO_BACKUP_URI" --db="$DB" --readPreference=secondaryPreferred \
  --gzip --archive="$WORK/dump.archive.gz" 2> "$WORK/dump.log" || { cat "$WORK/dump.log"; exit 1; }
# Print collection names and counts only (no document contents), and refuse an empty dump.
grep -oE 'done dumping [^ ]+ \([0-9]+ documents?\)' "$WORK/dump.log" | sed 's/done dumping /    /' || true
TOTAL="$(awk 'match($0, /\([0-9]+ documents?\)/) { s += substr($0, RSTART + 1, RLENGTH - 1) + 0 } END { print s + 0 }' "$WORK/dump.log")"
if [ "${TOTAL:-0}" -eq 0 ]; then
  echo "ERROR: the dump contains no documents. Is MONGO_DB_NAME ('$DB') the right database?" >&2
  exit 1
fi
echo "    total: $TOTAL documents, $(du -h "$WORK/dump.archive.gz" | cut -f1) compressed"

echo "==> Encrypting"
openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_PASSPHRASE \
  -in "$WORK/dump.archive.gz" -out "$WORK/$NAME"
# Prove the file decrypts back to the exact dump before uploading it.
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$WORK/$NAME" \
  | cmp - "$WORK/dump.archive.gz"
(cd "$WORK" && shasum -a 256 "$NAME" > "$NAME.sha256")
# Document count per collection (no contents), so the restore test can check every count matches.
sed -nE 's/.*done dumping [^.]+\.([^ ]+) \(([0-9]+) documents?\).*/\1 \2/p' "$WORK/dump.log" \
  | tr -d '`' | sort > "$WORK/$NAME.counts"

upload() {
  echo "==> Uploading to $1/"
  s3 s3 cp --only-show-errors "$WORK/$NAME" "s3://$B2_BUCKET/$1/$NAME"
  s3 s3 cp --only-show-errors "$WORK/$NAME.sha256" "s3://$B2_BUCKET/$1/$NAME.sha256"
  s3 s3 cp --only-show-errors "$WORK/$NAME.counts" "s3://$B2_BUCKET/$1/$NAME.counts"
}
upload daily
[ "$(date -u +%u)" = "7" ] && upload weekly   # Sundays
[ "$(date -u +%d)" = "01" ] && upload monthly # 1st of the month

# Keep the newest N backups in a folder. Counting (not age) means that if backups stop running,
# the last good copies are never deleted.
prune() {
  local prefix="$1" keep="$2" keys
  keys="$(s3 s3api list-objects-v2 --bucket "$B2_BUCKET" --prefix "$prefix/" \
    --query 'Contents[].Key' --output text | tr '\t' '\n' | grep -E '\.enc$' | sort || true)"
  local count
  count="$(printf '%s\n' "$keys" | grep -c . || true)"
  if [ "$count" -le "$keep" ]; then
    echo "==> $prefix/: $count backups, keeping all (limit $keep)"
    return
  fi
  echo "==> $prefix/: $count backups, deleting the oldest $((count - keep))"
  printf '%s\n' "$keys" | head -n "$((count - keep))" | while read -r key; do
    s3 s3 rm --only-show-errors "s3://$B2_BUCKET/$key"
    s3 s3 rm --only-show-errors "s3://$B2_BUCKET/$key.sha256" || true
    s3 s3 rm --only-show-errors "s3://$B2_BUCKET/$key.counts" || true
  done
}
prune daily "$KEEP_DAILY"
prune weekly "$KEEP_WEEKLY"
prune monthly "$KEEP_MONTHLY"

echo "==> Backup complete: $NAME"
