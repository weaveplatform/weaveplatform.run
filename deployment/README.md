# Hosting setup and release verification

The site builds locally without Cloudflare credentials. Production publication is deliberately gated by `DOCS_DEPLOY_ENABLED` until the account, domains, Access policies and environment rules are configured.

## Projects and domains

Create Direct Upload Pages projects named `weaveplatform-public` and `weaveplatform-internal`, each with production branch `main`. Use `weaveplatform.run` and `weaveplatform.dev` as their canonical custom domains. Attach and validate domains before adding Access to the custom domain; initially deploy only a placeholder page to the internal project.

See Cloudflare's [Direct Upload guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/) and [Access configuration](https://developers.cloudflare.com/pages/platform/known-issues/).

## GitHub configuration

Create `preview` and `production` GitHub environments. Restrict production to `main` and require repository-owner approval. Set these repository variables:

| Variable | Public value | Internal value |
| --- | --- | --- |
| `DOCS_AUDIENCE` | `public` | `internal` |
| `DOCS_PAGES_PROJECT` | `weaveplatform-public` | `weaveplatform-internal` |
| `DOCS_CANONICAL_URL` | `https://weaveplatform.run` | `https://weaveplatform.dev` |
| `DOCS_DEPLOY_ENABLED` | `false` until setup passes | `false` until Access verification passes |
| `DOCS_RELEASE_OWNER` | Unused; environment review applies | `ShocOne`; only this owner can dispatch an internal release |

The public production reviewer rule is configured. GitHub rejected required reviewers for the private repository's current billing plan. Internal publication therefore requires the release owner to dispatch the workflow on main with an exact passing build run ID; the workflow independently validates that run's repository, main branch, push event, quality-workflow identity, success and commit before downloading its artifact.

Add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as environment secrets in each environment. The deployment token requires Pages edit permission for the selected account. Use `gh secret set NAME --repo OWNER/REPO --env ENVIRONMENT` and supply its value through stdin or the interactive prompt.

The private repository's source-refresh workflow also needs a read-only `DOCS_SOURCE_TOKEN` covering the selected private product repositories. Public builds never need that credential.

Allow GitHub Actions to propose pull requests if source-refresh proposals are desired. Set branch protection to require the documentation validation job and code-owner review.

## Internal authentication

Create a Cloudflare GitHub identity provider using its [documented OAuth setup](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/github/). Restrict access to the `weaveplatform/docs-internal` team, which also grants read access to the private repository.

Configure Access applications for all three hostname patterns:

- `weaveplatform.dev` (plus `www.weaveplatform.dev` only if configured).
- `weaveplatform-internal.pages.dev`.
- `*.weaveplatform-internal.pages.dev` for preview aliases and deployment hashes.

The Pages [preview Access setting](https://developers.cloudflare.com/pages/configuration/preview-deployments/#customize-preview-deployments-access) protects previews only. Configure production and custom-domain applications separately.

Use placeholder content to verify an anonymous visitor and an authenticated non-team user cannot retrieve HTML, scripts, search bundles or diagrams at each hostname. Verify an authorised team member can retrieve them. The CI smoke job needs a separate narrowly scoped Access service-token policy and `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` secrets in production.

Record the checks and policy identifiers in the private environment register before enabling deployment. Robots directives are supplementary; Access enforces confidentiality.

The smoke script checks the canonical host and internal production Pages alias, their scripts and styles, search bundle, registered diagrams and deployment manifest. Set `DOCS_PREVIEW_URLS` to a JSON array of actual preview/hash URLs to check wildcard protection. Human non-team and authorised-team checks remain required for the GitHub identity policy.

## Publishing

Merge a reviewed change into `main`. The quality workflow builds the site and retains the site and evidence artifacts. Public production starts from that successful main-push run and waits for environment approval. For an internal release, the configured owner dispatches **Publish documentation** on main with the successful quality run ID. Both consume that exact artifact and write `deployment.json` with the documentation commit, build run and source-lock hash.

Trusted same-repository pull requests receive a `pr-N` Pages preview when deployment is enabled. Forks get validation and downloadable artifacts.

## Rollback

1. Record the failing and previous successful Pages deployment IDs and documentation commits.
2. In Cloudflare Pages, select the previous production deployment and choose **Rollback to this deployment**.
3. Run `scripts/smoke-deployment.mjs` with the canonical URL and audience. Internal checks additionally require the Access service token.
4. Confirm `deployment.json` identifies the restored commit and record the outcome in the private release log.

Initial deployment and rollback are not marked verified until these checks have actually run against the configured account.
