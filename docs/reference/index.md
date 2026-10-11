---
title: Reference index
description: Find the authoritative product APIs, agent protocols and configuration
  contracts.
product: platform
audience:
- consumer
- developer
- operator
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- guestweave-macos:internal/httpapi/server.go
- guestweave-windows:internal/serve/http.go
- hostweave:api/openapi.yaml
- agent-core:proto/weave/agent/v1/module.proto
- agent-modules:sdk/modulesdk/module.go
slug: /reference
---

The platform has several distinct interfaces. Generate reference from the owning repository’s contract and verify that contract against implementation. A central reference index does not make the interfaces one API.

| Interface | Authority | Validation boundary |
| --- | --- | --- |
| GuestWeave macOS HTTP | Product OpenAPI document served at `/weave/openapi.yaml` | Router/spec parity plus request/response conformance |
| GuestWeave Windows HTTP | Product OpenAPI document served at `/openapi.json` | Router/spec parity and bearer-token wrappers |
| HostWeave HTTP | Product `api/openapi.yaml` and generated server | Generated handlers, middleware and semantic tests |
| HostWeave host-agent protocol | Product agent protobuf | Gateway/runtime protocol tests |
| Agent lifecycle and host services | Agent-core protobuf | Buf lint, breaking-change and generation checks |
| Module implementation API | Agent-modules SDK | SDK interfaces and lifecycle/testkit behaviour |
| Module/channel manifests | Agent-core JSON schemas and parsers | Schema validity, parser rules and verifier checks |

## Available contract snapshots

The [contract catalogue](contracts.md) exposes public-source schemas and protobuf snapshots at recorded commits. These snapshots are inputs for reference generation; they are not a second editable contract.

Private-product OpenAPI documents remain in the private companion until a publication review approves an export. Their public interface entrypoints are documented above without uploading raw private source files.

## Next reference work

The next milestone adds generated operation pages, examples and configuration tables after semantic cross-checking. CLI reference will use actual command definitions or help output. Request bodies, authentication, error responses, streaming and operation completion must be verified in addition to method/path parity.
