# Database backups

The production database runs on MongoDB Atlas **Flex**. Atlas keeps daily snapshots for only a few days, has no point-in-time restore, and loses them if the Atlas project is deleted. So the database is also backed up every night to **Backblaze B2**, outside Atlas, and a restore is tested automatically every month.

| | Workflow | When | What it does |
|---|---|---|---|
| Backup | [db-backup.yml](../.github/workflows/db-backup.yml) | Every night, 02:00 India time | `mongodump` (read-only user) → AES-256 encryption → upload to B2 → delete copies beyond the retention limits |
| Restore test | [db-restore-test.yml](../.github/workflows/db-restore-test.yml) | The 3rd of every month, 03:00 India time | Downloads the newest backup, checks its checksum, decrypts it, restores it into a throwaway MongoDB inside the job, and checks every collection's document count matches the backup |

Both workflows can also be run by hand from **GitHub → Actions → (workflow) → Run workflow**. A failure sends an email to the alert address (see *Secrets*), and GitHub also emails the workflow's owner.

The backup script is [ops/db-backup/backup.sh](../ops/db-backup/backup.sh). Restores run on GitHub's servers, not on developer Macs: macOS's malware protection blocks scripts that download and decrypt files, and it moved an earlier local restore script to the Trash.

## What is kept

Each backup is three files in the bucket, named `cog-<database>-<UTC timestamp>…`:

- `….archive.gz.enc`: the compressed `mongodump` archive, encrypted with `openssl` (AES-256-CBC, PBKDF2, 200,000 iterations).
- `….sha256`: its checksum, used to detect a corrupt download.
- `….counts`: the document count per collection at backup time. It holds counts only, never data.

| Folder | Written | Copies kept |
|---|---|---|
| `daily/` | every night | 7 |
| `weekly/` | Sundays (UTC) | 4 |
| `monthly/` | the 1st (UTC) | 3 |

Old copies are deleted by **count, not age**. If the job stops running, the last good copies are never removed.

Uploaded files (lesson videos and PDFs) are **not** in these backups. They live in Cloudinary, and the database only stores links to them. See *Cloudinary files* below.

## One-time setup

1. **Backblaze B2**
   - Create a **private** bucket, for example `logos-db-backups`.
   - In the bucket's *Lifecycle Settings*, choose **Keep only the last version of the file**. Without this, deleted backups are only hidden and are still billed.
   - Create an **Application Key** restricted to that bucket, with *Read and Write* access. Note the `keyID`, the `applicationKey` (shown only once), and the bucket's **S3 endpoint**, such as `https://s3.us-west-004.backblazeb2.com`.
2. **MongoDB Atlas**
   - Under *Database Access → Add New Database User*, create a user such as `backup-reader` with the built-in role **Only read any database**.
   - Copy its connection string from *Connect → Drivers*.
3. **Passphrase**
   - Generate a long random passphrase, for example with `openssl rand -base64 32`.
   - Store it in the team's password manager as well as in GitHub. **Without it, the backups cannot be read.**
4. **GitHub** (*Settings → Secrets and variables → Actions*)

   | Name | Type | Value |
   |---|---|---|
   | `MONGO_BACKUP_URI` | secret | The read-only user's connection string |
   | `BACKUP_PASSPHRASE` | secret | The passphrase |
   | `B2_KEY_ID` | secret | The application key's `keyID` |
   | `B2_APPLICATION_KEY` | secret | The `applicationKey` |
   | `B2_BUCKET` | secret | The bucket name |
   | `B2_ENDPOINT` | secret | The bucket's S3 endpoint URL |
   | `ALERT_SMTP_HOST`, `ALERT_SMTP_PORT`, `ALERT_SMTP_USER`, `ALERT_SMTP_PASSWORD` | secrets | The SMTP account used to send alerts. It can be the one in `server/.env`. |
   | `ALERT_EMAIL_TO` | secret | The address that receives failure alerts |
   | `MONGO_DB_NAME` | variable | The production database name. The default is `test`, which is what Mongoose uses when the URI names no database. |

5. **First run:** run **DB backup** by hand, then **DB restore test**. Both should finish green, and the restore test log lists every collection with "All counts match the backup."

Scheduled workflows only run from the default branch (`main`).

## Restoring in an emergency

Restore into a **new or local database first**, check it, and only then decide how to bring data back to production. Never restore over the live database without a fresh backup of its current state.

You need the passphrase, the B2 key, and the [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) (`mongorestore`). The `aws` command-line tool talks to B2's S3 API. Run these commands by hand; don't save them as a script on a Mac, because macOS will block it as described above.

```bash
export AWS_ACCESS_KEY_ID='<B2 keyID>' AWS_SECRET_ACCESS_KEY='<B2 applicationKey>'
export AWS_DEFAULT_REGION=us-west-004            # the region part of the B2 endpoint
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required AWS_RESPONSE_CHECKSUM_VALIDATION=when_required
EP=https://s3.us-west-004.backblazeb2.com BUCKET=logos-db-backups

# 1. List the backups and pick one (or use the newest daily)
aws --endpoint-url $EP s3 ls s3://$BUCKET/daily/

# 2. Download it and check the checksum
KEY=daily/cog-test-2026-10-21T2030Z.archive.gz.enc
aws --endpoint-url $EP s3 cp s3://$BUCKET/$KEY backup.enc
aws --endpoint-url $EP s3 cp s3://$BUCKET/$KEY.sha256 - ; shasum -a 256 backup.enc

# 3. Decrypt it (you will be asked for the passphrase)
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in backup.enc -out dump.archive.gz

# 4a. Restore everything into a separate database, here "restore_check"
mongorestore --uri="mongodb://127.0.0.1:27017" --gzip --archive=dump.archive.gz \
  --nsFrom='test.*' --nsTo='restore_check.*'

# 4b. Or restore one collection only, here "users"
mongorestore --uri="mongodb://127.0.0.1:27017" --gzip --archive=dump.archive.gz \
  --nsInclude='test.users' --nsFrom='test.*' --nsTo='restore_check.*'

# 5. Delete the decrypted copy when done: it contains personal data
rm -f backup.enc dump.archive.gz
```

To rebuild production from a backup (for example into a new Atlas cluster), use the new cluster's URI in step 4 with `--nsTo='test.*'`. Do this only with sign-off, and after the application is stopped.

## Cloudinary files

Lesson videos, PDFs and assignment files are stored in Cloudinary. The database backup keeps only their links. Options, in order of preference:

1. **Cloudinary's built-in backup** (*Settings → Backup*, available on paid plans). It keeps versioned copies of every upload and can restore deleted files from the Media Library. Turn it on if the plan allows; it needs no code.
2. **Copying to B2.** A scheduled job lists resources with the Cloudinary Admin API and copies new files to `cloudinary/` in a second B2 bucket. This is needed if the plan has no backup feature, and it would be its own ticket.

Until one of these is in place, a file deleted in Cloudinary (including by the app's cascading deletes) cannot be recovered from these backups.
