#!/usr/bin/env bash
# Usage: ./commit-safe.sh "commit message"
# Stash local changes, redact secret line in TASK.md for commit, then restore full file locally

COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
  echo "Usage: $0 \"commit message\""
  exit 1
fi

# Ensure TASK.md has local secret
# Stash all local changes including untracked
git stash push --include-untracked --message "pre-redact-tasks"

# Redact the OpenAI key line in TASK.md
sed -E "s/^(- My OpenAI API Key:).*/\1 **[REDACTED]** (use environment variable OPENAI_API_KEY)/" TASK.md

# Stage changes and commit
git add TASK.md
# Stage other docs if any
# (you can adjust this to add specific files as needed)
# Commit and push
git commit -m "$COMMIT_MSG"
git push

# Restore original TASK.md with secret
git checkout -- TASK.md
# Pop the stash to restore any other changes
git stash pop
