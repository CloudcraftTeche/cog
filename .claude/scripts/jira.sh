#!/usr/bin/env bash
# Minimal Jira Cloud REST helper used by the /jira-* skills.
# Credentials come from .claude/jira.env (gitignored) or the environment:
#   JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN
set -euo pipefail

if [ $# -eq 0 ]; then
  sed -n '/^Usage:/,/^  url/p' "$0" | sed 's/^  //'; exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"
[ -f "$ROOT/.claude/jira.env" ] && source "$ROOT/.claude/jira.env"
: "${JIRA_BASE_URL:?JIRA_BASE_URL not set (see .claude/jira.env.example)}"
: "${JIRA_EMAIL:?JIRA_EMAIL not set}"
: "${JIRA_API_TOKEN:?JIRA_API_TOKEN not set}"
API="${JIRA_BASE_URL%/}/rest/api/2"

req() { # req METHOD PATH [JSON_BODY]
  local args=(-sS -f -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Accept: application/json" -X "$1")
  [ $# -ge 3 ] && args+=(-H "Content-Type: application/json" --data "$3")
  curl "${args[@]}" "$API$2"
}

usage() {
  cat <<USAGE
Usage: jira.sh <command> [args]
  get <KEY>                  Print the issue (summary, type, status, description, custom fields, comments, links)
  transitions <KEY>          List transitions available from the current status
  transition <KEY> <STATUS>  Move the issue to that status (name, case-insensitive) or alias: progress | review | done
  comment <KEY> <TEXT>       Add a comment (Jira wiki markup)
  create <PROJECT> <TYPE> <SUMMARY> [DESCRIPTION] [PARENT] [LABELS]   Create an issue, prints its key
                             PARENT: epic key for a story, story key for a subtask; LABELS: comma-separated
  search <JQL> [MAX]         List issues matching a JQL query
  meta <PROJECT>             List the project's issue types and statuses
  url <KEY>                  Print the browse URL
USAGE
  exit 1
}

cmd="${1:-}"; shift || true
case "$cmd" in
  get)
    key="${1:?KEY required}"
    req GET "/issue/$key?expand=names&fields=*all" | jq -r --arg url "${JIRA_BASE_URL%/}/browse/$key" '
      . as $i | $i.fields as $f |
      "KEY: \($i.key)\nURL: \($url)\nTYPE: \($f.issuetype.name)\nSTATUS: \($f.status.name)\nPRIORITY: \($f.priority.name // "-")\nLABELS: \(($f.labels // []) | join(", "))",
      (if $f.parent then "PARENT: \($f.parent.key) \($f.parent.fields.summary)" else empty end),
      "SUMMARY: \($f.summary)",
      "\n--- DESCRIPTION ---\n\($f.description // "(empty)")",
      ( [ $f | to_entries[] | select(.key | startswith("customfield_")) | select(.value != null)
          | select((.value | type) == "string" and (.value | length) > 0)
          | "\n--- \($i.names[.key] // .key) ---\n\(.value)" ] | .[] ),
      (if ($f.subtasks | length) > 0 then "\n--- SUBTASKS ---", ($f.subtasks[] | "\(.key) [\(.fields.status.name)] \(.fields.summary)") else empty end),
      (if ($f.issuelinks | length) > 0 then "\n--- LINKS ---", ($f.issuelinks[] | "\(.type.name): \((.outwardIssue // .inwardIssue) | "\(.key) \(.fields.summary)")") else empty end),
      (if ($f.attachment | length) > 0 then "\n--- ATTACHMENTS ---", ($f.attachment[] | "\(.filename) \(.content)") else empty end),
      (if ($f.comment.comments | length) > 0 then "\n--- COMMENTS ---", ($f.comment.comments[] | "[\(.author.displayName) \(.created[0:10])] \(.body)") else empty end)
    ' ;;
  transitions)
    req GET "/issue/${1:?KEY required}/transitions" | jq -r '.transitions[] | "\(.id)\t\(.name)\t-> \(.to.name)"' ;;
  transition)
    key="${1:?KEY required}"; target="${2:?STATUS required}"
    case "$target" in # aliases resolved from jira.env
      progress) target="${JIRA_STATUS_IN_PROGRESS:-In Progress}" ;;
      review)   target="${JIRA_STATUS_IN_REVIEW:-In Review}" ;;
      done)     target="${JIRA_STATUS_DONE:-Done}" ;;
    esac
    id="$(req GET "/issue/$key/transitions" | jq -r --arg t "$target" \
      '[.transitions[] | select((.to.name|ascii_downcase)==($t|ascii_downcase) or (.name|ascii_downcase)==($t|ascii_downcase))][0].id // empty')"
    if [ -z "$id" ]; then
      echo "No transition to '$target' from current status. Available:" >&2
      req GET "/issue/$key/transitions" | jq -r '.transitions[] | "  \(.name) -> \(.to.name)"' >&2
      exit 2
    fi
    req POST "/issue/$key/transitions" "$(jq -n --arg id "$id" '{transition:{id:$id}}')" >/dev/null
    echo "$key -> $target" ;;
  comment)
    key="${1:?KEY required}"; shift; text="${*:?TEXT required}"
    req POST "/issue/$key/comment" "$(jq -n --arg b "$text" '{body:$b}')" | jq -r '"Comment added: \(.id)"' ;;
  create)
    project="${1:?PROJECT required}"; type="${2:?TYPE required}"; summary="${3:?SUMMARY required}"; desc="${4:-}"
    parent="${5:-}"; labels="${6:-}"
    req POST "/issue" "$(jq -n --arg p "$project" --arg t "$type" --arg s "$summary" --arg d "$desc" \
      --arg parent "$parent" --arg labels "$labels" \
      '{fields:({project:{key:$p}, issuetype:{name:$t}, summary:$s, description:$d}
        + (if $parent != "" then {parent:{key:$parent}} else {} end)
        + (if $labels != "" then {labels:($labels | split(","))} else {} end))}')" | jq -r '.key' ;;
  search)
    jql="${1:?JQL required}"
    req GET "/search/jql?jql=$(jq -rn --arg q "$jql" '$q|@uri')&maxResults=${2:-20}&fields=summary,status,issuetype" |
      jq -r '.issues[] | "\(.key)\t\(.fields.issuetype.name)\t\(.fields.status.name)\t\(.fields.summary)"' ;;
  meta)
    p="${1:?PROJECT required}"
    echo "Issue types:"; req GET "/issue/createmeta/$p/issuetypes" | jq -r '(.issueTypes // .values)[] | "  \(.name)"'
    echo "Statuses:"; req GET "/project/$p/statuses" | jq -r '[.[].statuses[].name] | unique[] | "  \(.)"' ;;
  url)
    echo "${JIRA_BASE_URL%/}/browse/${1:?KEY required}" ;;
  *) usage ;;
esac
