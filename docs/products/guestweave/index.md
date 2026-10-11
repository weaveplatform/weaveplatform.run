---
title: GuestWeave
description: Understand the separate macOS and Windows host VM managers.
product: guestweave
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
- hostweave:agent/runtime/guestweave/guestweave.go
slug: /products/guestweave
---

GuestWeave manages guest virtual machines on a local host. The current documentation covers two implementations: macOS and Windows. Their command surfaces, HTTP routes, backend APIs and image formats must be documented separately.

| Host implementation | Design | Key interface boundary |
| --- | --- | --- |
| macOS | [macOS HLD](macos.mdx) | CLI, HTTP adapters and a separate MCP server |
| Windows | [Windows HLD](windows.mdx) | CLI and guarded HTTP server over Windows host services |

HostWeave can drive GuestWeave through a runtime adapter that invokes the local CLI. GuestWeave remains responsible for VM lifecycle; HostWeave remains responsible for placement and orchestration.

## Consumer contract

The implementations expose VM creation and lifecycle operations, but similar operation names do not guarantee identical requests. For example, the inspected macOS router uses a VM `run` route, while Windows uses `start`. The [reference index](../../reference/index.md) points to the two contracts independently.

## Documentation baseline

Both implementations have private source repositories. This public knowledge base describes their approved product responsibilities and interfaces; detailed evidence references live in the private companion. Host/guest combinations need runtime acceptance before receiving a support claim.
