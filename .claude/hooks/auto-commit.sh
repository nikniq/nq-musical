#!/usr/bin/env bash
# Stop hook: commit any changes and push to origin/main after each Claude turn.
cd "$CLAUDE_PROJECT_DIR" || exit 0
git add -A
git diff --cached --quiet && exit 0
files=$(git diff --cached --name-only | head -5 | tr '\n' ' ')
git commit -q -m "Auto-commit: ${files}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || exit 0
if git push -q origin HEAD:main 2>/tmp/nq-push-err; then
  echo '{"systemMessage":"Auto-committed and pushed to GitHub."}'
else
  echo "{\"systemMessage\":\"Auto-committed locally, but push failed: $(head -1 /tmp/nq-push-err | tr -d '\"')\"}"
fi
