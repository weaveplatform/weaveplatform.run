# Weave platform knowledge base

This repository is the canonical source for public Weave documentation and its website, **weaveplatform.run**. It serves consumers, developers and operators. Confidential implementation evidence and operational knowledge live in the private **weaveplatform.dev** companion.

The first release covers the platform HLD and GuestWeave, HostWeave, Imageweave, agent-core and agent-modules. Diagrams use **Archify**. Claims follow inspected code at exact commits; the compatibility register makes incomplete integrations explicit.

Windows GuestWeave's main and development architectures have separate HLDs and source pins. The [PR11 implementation audit](sources/reviews/pr11-code-audit.md) records the corrected product relationships and remaining integration gaps.

## Local use

Use Node **22.23.3** and npm:

```bash
npm ci
npm run start
```

For the complete static website, including search:

```bash
npm run build
npm run serve
```

## Verification

```bash
npm run validate
npm test
npm run build
npm run check:links
npm run typecheck
npm run diagrams:visual
npm run check:browser
```

Browser checks use installed Chrome on macOS and the runner browser in CI. Override the site browser with `CHROME_BIN` if necessary. Archify uses its packaged browser discovery. Its delivery receipt, automated browser evidence and perceptual review are separate claims.

## Layout

| Location | Owns |
| --- | --- |
| `docs/` | Authored product and platform knowledge |
| `diagrams/sources/` | Canonical typed diagram specifications |
| `sources/` | Repository inventory, exact source pins and reviewed contract snapshots |
| `site/` | Docusaurus navigation, pages and static build |
| `packages/docs-kit/` | Shared theme, components and content schema |
| `tools/archify/` | Checksummed renderer distribution and third-party notices |
| `scripts/` | Content, evidence, diagram, browser and publication checks |
| `deployment/` | Hosting prerequisites and release procedures |

See [contribution guidance](CONTRIBUTING.md), [publishing setup](deployment/README.md) and the [content roadmap](docs/development/roadmap.md).

## Companion bootstrap

`npm run companion:prepare -- --out /absolute/empty/path` prepares an independent private repository with the same checks and a checksummed bootstrap of the shared kit. Add `--evidence-dir /absolute/evidence/cache` to include the selected private contract snapshots. It does not copy credentials, Git metadata, node_modules or public product prose.

Until the first public docs-kit release exists, the private site uses that recorded bootstrap. Later releases are immutable archives from this repository; update the private pin through a reviewed change.

No live publication is implied by a successful local build. Cloudflare deployment remains disabled until the account and access setup pass the documented checks.
