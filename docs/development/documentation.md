---
title: Contribute documentation
description: Author and verify Weave knowledge using implementation evidence and Archify
  diagrams.
product: documentation
audience:
- contributor
- developer
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- documentation:scripts/validate.mjs
- documentation:scripts/diagrams.mjs
- documentation:sources/sources.lock.yaml
---

Documentation changes follow the same reviewed workflow as code. Every material implementation claim needs evidence at an exact source baseline.

## Local authoring

```bash
npm ci
npm run start
```

Use Node 22 at the version recorded in `.node-version`. Markdown lives in `docs/`; navigation lives in the site sidebar. Diagram JSON lives in `diagrams/sources/` and is registered in its manifest.

```bash
npm run validate
npm test
npm run build
npm run check:links
npm run typecheck
npm run diagrams:visual
npm run check:browser
```

Search is indexed from the production HTML. Use `npm run serve` after a build to inspect it locally. Browser checks serve and stop their own preview.

## Evidence and ownership

Pages declare title, description, product, audience, owner, status, verification date and evidence references in frontmatter. `sources/sources.lock.yaml` records exact source revisions, inspected paths and checksums. Public builds accept snapshots only from public sources; private implementation evidence stays in the companion.

Use `code-inspected` for static implementation review. Use `runtime-verified` only when a reproducible acceptance record exists. A changed upstream file does not automatically reverify an existing page.

## Diagrams

Use the pinned Archify bundle. Author the appropriate architecture, workflow or sequence JSON with stable IDs, a clear main path and `meta.quality_profile: showcase`. Diagram evidence references identify the actual code behind the relationships.

The build requires nine showcase checks, zero composition errors and zero warnings. Visual checks bind browser screenshots and measurements to the delivered HTML. Inspect the screenshots in both themes before approval; machine containment checks do not establish visual polish.

Generation receipts and browser screenshots remain build artifacts. The website includes only delivered viewers and approved content.

## Pull request review

Explain the user-visible knowledge change, source baseline, cross-checks and limitations. Reviewers confirm the evidence, inspect diagrams, and approve any public export from a private implementation. Keep proposed behaviour separate from implemented behaviour.

Upstream refresh produces a review report. It does not rewrite prose, change verification dates or silently move the baseline.
