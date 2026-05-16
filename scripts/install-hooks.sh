#!/bin/sh
# Run once per dev machine to install git hooks from .github/hooks/
# Usage: sh scripts/install-hooks.sh

HOOKS_DIR="$(git rev-parse --git-dir)/hooks"
SOURCE_DIR="$(git rev-parse --show-toplevel)/.github/hooks"

for hook in "$SOURCE_DIR"/*; do
  name=$(basename "$hook")
  target="$HOOKS_DIR/$name"
  cp "$hook" "$target"
  chmod +x "$target"
  echo "Installed: $name -> $target"
done

echo "✅ Git hooks installed."
