---
title: Reference index
description: Find the authoritative product APIs, agent protocols and
  configuration contracts.
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
- guestweave-macos:internal/httpapi/vms.go
- guestweave-macos:internal/httpapi/guest.go
- guestweave-macos:internal/mcp/server_mcp.go
- guestweave-windows:internal/serve/auth.go
- guestweave-windows:internal/guestweaveagent/proto/proto.go
- guestweave-windows:internal/command/commands_agent.go
- agent-modules:sdk/protocol/hvchannel/hvchannel.go
- agent-modules:sdk/weaveclient/weaveclient.go
- guestweave-windows-development:internal/serve/vmcreate.go
- guestweave-windows-development:internal/serve/mcp.go
slug: /reference
---

The platform has several distinct interfaces. Generate reference from the owning repository’s contract and verify that contract against implementation. A central reference index does not make the interfaces one API.

| Interface | Authority | Validation boundary |
| --- | --- | --- |
| GuestWeave macOS HTTP | Product OpenAPI document served at `/weave/openapi.yaml` and actual handlers | Router/spec parity is only a starting point; verify SSH execution, stop policy, credentials and completion semantics |
| GuestWeave Windows HTTP | Product OpenAPI document served at `/openapi.json` and served-handler wrappers | Verify bearer token, Host guard, exemptions and operation-specific state rules |
| HostWeave HTTP | Product `api/openapi.yaml`, generated server and middleware | Verify authentication, policy, placement and asynchronous attempt outcomes |
| HostWeave host-agent protocol | Product agent protobuf and gateway/client | Separate enrollment and outbound host session; not agent-core RPC |
| Agent lifecycle and host services | Agent-core protobuf and runtime handlers | Local gRPC; verify generated versions, launch token and lifecycle semantics |
| macOS guest capability wire/client | Core/SDK frame implementations and agent-modules weaveclient/weavewire | External framed JSON; lifecycle Protocol `1` does not negotiate this wire |
| Windows main resident guest bus | GuestWeave Windows `internal/guestweaveagent/proto`, client and registered handlers | Own `weave-guestd/1` hello and module/op frames; separate from core/SDK wire |
| Windows development guest integration | Migration branch's guestchannel, guestctl and CLI/REST/MCP adapters | Shared SDK/core channel replaces the legacy bus; verify surface semantics and branch-specific prerequisites |
| Windows main supplied SSH agent | Product command implementation plus caller-supplied binary | Upload/invoke over SSH; resident-bus or agent-core compatibility cannot be assumed |
| Module implementation API | Agent-modules SDK | Verify implementation hooks, placement, host-service use and capability operations |
| Module/channel manifests | Agent-core JSON schemas and parsers | Schema validity, parser rules and verifier checks |

## Available contract snapshots

The [contract catalogue](contracts.md) exposes public-source schemas and protobuf snapshots at recorded commits. These snapshots are inputs for reference generation; they are not a second editable contract.

Private-product OpenAPI documents remain in the private companion until a publication review approves an export. Their public interface entrypoints are documented above without uploading raw private source files.

## Interface semantics

macOS CLI exec uses the authenticated SDK/core guest channel; HTTP/MCP exec uses SSH. CLI stop defaults to graceful, while the inspected HTTP/MCP handlers construct a hard stop. The macOS HTTP listener defaults to loopback and has no API authentication in the inspected server. Windows's served HTTP router adds bearer-token and Host-header checks; constructing `NewHTTPHandler` alone does not add those wrappers. See the [macOS](../products/guestweave/macos.mdx) and [Windows](../products/guestweave/windows.mdx) HLDs before using a CLI example as an API equivalent.

The [Windows development branch](../products/guestweave/windows-development.mdx) routes CLI, REST and MCP exec through its SDK-backed run supervisor. That differs from both Windows main's native bus and macOS's SSH-based API exec; sharing core/modules does not establish complete API parity.

An endpoint in a schema, a registered route and a successful parity test do not establish its side effects, permission checks, streaming behaviour or readiness condition. This review inspected those implementation paths; it did not execute product API acceptance tests.

## Next reference work

The next milestone adds generated operation pages, examples and configuration tables after semantic cross-checking. CLI reference will use actual command definitions or help output. Request bodies, authentication, error responses, streaming and operation completion must be verified in addition to method/path parity.
