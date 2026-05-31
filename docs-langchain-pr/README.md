# LangChain docs PR — Delegare integration

Two MDX files ready to drop into a fork of [`langchain-ai/docs`](https://github.com/langchain-ai/docs).

## Files

- `tools/delegare.mdx` → goes to `src/oss/python/integrations/tools/delegare.mdx`
  - This is the headline file. Frontmatter has `category: finance` so it shows on `docs.langchain.com/oss/python/integrations/tools#finance`.

- `providers/delegare.mdx` → goes to `src/oss/python/integrations/providers/delegare.mdx`
  - Provider overview, points to the tools page.

## Submission

```bash
# 1. Fork + clone
gh repo fork langchain-ai/docs --clone
cd docs

# 2. Branch
git checkout -b add-delegare-integration

# 3. Copy the files (paths may need verification — check existing entries first)
mkdir -p src/oss/python/integrations/tools src/oss/python/integrations/providers
cp /path/to/delegare/docs-langchain-pr/tools/delegare.mdx \
   src/oss/python/integrations/tools/
cp /path/to/delegare/docs-langchain-pr/providers/delegare.mdx \
   src/oss/python/integrations/providers/

# 4. Find the sidebar/nav config and add entries
#    The docs repo likely uses docs.json (Mintlify) or a similar file at the root.
#    Look at where ampersand / stripe are referenced for the pattern.
grep -rln "ampersand\|stripe" --include="*.json" --include="*.yaml" --include="*.yml" .

# 5. Verify it renders locally if Mintlify CLI is set up
#    npm install -g mintlify
#    mintlify dev

# 6. Commit + push + PR
git add src/oss/python/integrations/
# Also add whatever sidebar/nav file you edited
git commit -m "docs: add Delegare integration

Adds documentation for langchain-delegare, an integration that lets
LangChain agents authorize payments via AP2 mandates with multi-rail
settlement and built-in budget guardrails.

Package: https://pypi.org/project/langchain-delegare/
Source:  https://github.com/orgtom78/delegare"
git push origin add-delegare-integration

gh pr create \
  --repo langchain-ai/docs \
  --title "docs: add Delegare integration (finance)" \
  --body-file pr-body.md
```

## PR body template

Use this for the PR description:

```markdown
## Summary

Adds documentation for `langchain-delegare` — agent payment authorization tools built on the AP2 protocol.

- **Package**: https://pypi.org/project/langchain-delegare/ (v0.1.0)
- **Source**: https://github.com/orgtom78/delegare
- **Underlying SDK**: https://pypi.org/project/delegare/

## What it adds

- `src/oss/python/integrations/tools/delegare.mdx` — toolkit page with the seven tools, LangGraph-aware idempotency, x402 paywall auto-pay, and budget-aware callback handler
- `src/oss/python/integrations/providers/delegare.mdx` — provider overview

Category: **finance** (alongside Stripe, etc.)

## Verification

- Package installs cleanly from PyPI: `pip install langchain-delegare`
- Tools instantiate and execute end-to-end against the Delegare sandbox API (live AWS Lambda integration test confirms wire format + auth + every tool path)
- All code examples in the MDX are runnable with sandbox credentials (placeholders in docs)

## Notes for reviewers

- The package follows the standard partner-package layout — published to PyPI by the Delegare team, tracks `langchain-core>=0.3,<0.5`, mypy-strict, ruff-clean.
- The LangGraph-native idempotency primitive (`get_idempotency_key`) is the unique angle vs other payment integrations — derives a deterministic UUID v5 from `thread_id + run_id + tool_call_id` so retries don't double-charge.
```

## Pre-submission checklist

- [ ] Visit `docs.langchain.com/oss/python/integrations/tools/stripe` or `/ampersand` to confirm the actual current frontmatter / format — adjust ours to match exactly
- [ ] Verify the directory path with `ls src/oss/python/integrations/tools/` in the fork
- [ ] Verify which sidebar/nav file controls the listing — usually `docs.json` or `mint.json` at the repo root
- [ ] Test all code snippets parse: copy each Python block into a `.py` file and run `python -c "import ast; ast.parse(open(file).read())"`
- [ ] Cross-check that the GitHub repo URL in the MDX is the canonical public repo, not a private fork

## Tips that move the PR faster

1. Reference the **published PyPI URL** in the PR body — proves the package exists and the docs are real
2. Mention the **live integration test** result — proves the tools actually work
3. Keep the PR scoped — just the 2-3 new files + sidebar entry. No drive-by edits.
4. If review is slow, ping `#general` in the LangChain Discord with a polite message and PR link

## Timeline

LangChain merges integration PRs in 1-3 weeks typically. Their integration team is small and volume-throttled.
