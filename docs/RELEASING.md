# Releasing

How a version of Logos is cut, tagged and published. The client and server always share one version number, and the history lives in [CHANGELOG.md](../CHANGELOG.md).

## Choosing the version

Versions follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Bump | When | Example |
|---|---|---|
| **MAJOR** (`2.0.0`) | Behaviour users rely on changes, an API response changes shape, or existing data is migrated | Chapters require games before completing |
| **MINOR** (`1.1.0`) | New features that leave existing behaviour alone | Installable app, a new report |
| **PATCH** (`1.1.1`) | Bug fixes only | A button that did not submit |

If a release contains a database migration, it is at least a MINOR release, and it must be listed under **Upgrade notes** in the changelog.

## Jira labels

Every Story and Epic carries the version it is planned for as a label, such as `v1.1.0` or `v2.0.0`. When plans change, update the label. Labels let you check a release is complete:

```bash
.claude/scripts/jira.sh search 'project = LOGOS AND labels = "v1.1.0" AND status != Done'
```

Change a ticket's labels with `.claude/scripts/jira.sh labels <KEY> v1.1.0`.

## Cutting a release

1. **Check the scope.** Every ticket for the version should be Done and merged into `main`. The search above should return nothing.
2. **Branch.** Use `release/vX.Y.Z` off an up-to-date `main` (or the ticket branch, when a Jira ticket covers the release).
3. **Bump both versions.** This also updates the lockfiles, and the app shows the new version at the bottom of the sidebar.
   ```bash
   (cd client && npm version X.Y.Z --no-git-tag-version)
   (cd server && npm version X.Y.Z --no-git-tag-version)
   ```
4. **Write the changelog.** In `CHANGELOG.md`, add a `## [X.Y.Z] - YYYY-MM-DD` section below `[Unreleased]`, written for users, with Jira keys in brackets. Group entries by area, and end with **Upgrade notes**: migrations, new env vars, new API routes. Then update the compare links at the bottom. To see what went in:
   ```bash
   git log vPREVIOUS..main --no-merges --oneline
   ```
5. **Open a PR** titled `Release vX.Y.Z` (or `<KEY>: …`), and merge it after review.
6. **Tag the merge commit** on `main` with an annotated tag, then push it:
   ```bash
   git switch main && git pull --ff-only
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```
7. **Publish the GitHub Release**, using that version's changelog section as the notes:
   ```bash
   awk '/^## \[X.Y.Z\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md > /tmp/notes.md
   gh release create vX.Y.Z --title "vX.Y.Z" --notes-file /tmp/notes.md --verify-tag
   ```
8. **Deploy** from the tag. Run any migration listed under Upgrade notes only after it has been approved, and back up the database first.

## Hotfixes

Branch `fix/<KEY>-…` off `main`. When it merges, cut a PATCH release with the steps above, so the fix gets its own tag.

## Releases so far

| Version | Date | Highlights |
|---|---|---|
| [1.1.0](https://github.com/CloudcraftTeche/cog/releases/tag/v1.1.0) | 2026-10-21 | Installable app (PWA) for all roles, student attendance report |
| [1.0.0](https://github.com/CloudcraftTeche/cog/releases/tag/v1.0.0) | 2026-10-20 | Baseline release |
