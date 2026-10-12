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

Inspect complete source trees at the locked commits, then follow entrypoints through dispatch, adapters and handlers. Check both ends of a wire and both producer and consumer of an artifact. Package manifests and comments are clues; they do not override executed code. Separately record dependency versions, installer-selected releases and embedded payload provenance. A current source checkout does not certify an older released binary.

The validator proves that evidence references resolve to registered paths and that contract snapshots match their checksums. It does not prove that a sentence accurately describes those files. That requires code review.

## HLD content requirements

An HLD should let a reader follow a real operation and identify the cause of failure. Include:

- Process ownership and placement: physical host, guest, control plane, linked library or separate executable.
- Actual product dependencies and optional adapters, including differences between platform implementations.
- A request traced from its entrypoint through transport, authentication, dispatch and reply.
- Startup, readiness, shutdown, update/recovery and durable state, with their distinct success conditions.
- Storage/artifact contracts, configuration and credential boundaries, plus implemented failure behaviour.
- Source anchors for mechanisms and a clear statement of acceptance/provenance gaps.

Do not infer shared semantics from an `agent`, `module` or `host` name. Do not infer HTTP/CLI parity from a shared command structure. Describe what the selected code and inputs permit, including incomplete checked-in inputs.

## Diagrams

Use the pinned Archify bundle. Author the appropriate architecture, workflow or sequence JSON with stable IDs, a clear main path and `meta.quality_profile: showcase`. Diagram evidence references identify the actual code behind the relationships.

The build requires nine showcase checks, zero composition errors and zero warnings. Visual checks bind browser screenshots and measurements to the delivered HTML. Inspect the screenshots in both themes before approval; machine containment checks do not establish visual polish.

Every relationship needs a code-backed mechanism and direction. Boundaries describe actual process/deployment placement. A diagram is a selected view of the design; the accompanying HLD must explain the omitted paths and the meaning of each arrow. Separate artifact construction, consumer admission, runtime acceptance and publication/promotion rather than implying one guaranteed pipeline.

Generation receipts and browser screenshots remain build artifacts. The website includes only delivered viewers and approved content.

## Pull request review

Explain the user-visible knowledge change, source baseline, cross-checks and limitations. Reviewers confirm the evidence, inspect diagrams, and approve any public export from a private implementation. Keep proposed behaviour separate from implemented behaviour.

Upstream refresh resolves each source's declared branch or tag and produces a review report. It does not rewrite prose, change verification dates or silently move the baseline.
