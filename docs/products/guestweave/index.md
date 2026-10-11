---
title: GuestWeave
description: Host VM managers, guest payloads and the different integrations
  that compose GuestWeave.
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
- guestweave-macos:internal/vm/run/guestchannel.go
- guestweave-macos:internal/vm/guestagent/packages.go
- guestweave-windows:cmd/weaveagent/modulebus.go
- guestweave-windows:internal/guestweaveagent/proto/proto.go
- agent-modules:sdk/weaveclient/weaveclient.go
- guestweave-windows-development:go.mod
- guestweave-windows-development:internal/command/commands_exec.go
slug: /products/guestweave
---

GuestWeave includes the host VM manager and the mechanisms that make a guest usable from that host: guest installation, command execution, clipboard, readiness, channels and image/state handling. The macOS and Windows source trees implement different compositions. A product name does not imply a shared guest agent, identical API semantics or an interchangeable image.

| Host implementation | Design | Key interface boundary |
| --- | --- | --- |
| macOS | [macOS HLD](macos.mdx) | Virtualization.framework for macOS/Linux guests; native Hypervisor.framework path for Windows-on-mac; SDK client reaches guest core/modules |
| Windows main | [Windows HLD](windows.mdx) | HCS VM management; repository-owned resident guest agent/module bus; separate SSH-supplied agent path |
| Windows development | [Migration HLD](windows-development.mdx) | Shared SDK/core/module guest integration; independently pinned branch, with remaining companion/parity gaps |

## What belongs where

| Component | macOS main implementation | Windows main implementation |
| --- | --- | --- |
| Physical-host VM manager | `weave` run process owns the VM, state and hypervisor/native runtime | `weave` commands and detached supervisor manage HCS compute systems and state |
| Host-side guest client | Agent-modules SDK `weaveclient`, one channel owner per running guest | Local `internal/guestweaveagent/client` and related client paths |
| Guest capability runtime | Selected agent-core release; current core source uses weaveboot → weave-agent supervision | Repository-owned Linux weaveagent / Windows weaveguestd resident binaries |
| Capability implementation | Agent-modules OS executables supervised by core | Native agent's local module registry; capability coverage differs by guest OS |
| Guest command wire | SDK/core framed capability envelopes over console/AgentLink | Local framed JSON protocol over HvSocket/AF_VSOCK; a separate supplied agent can run over SSH |

Agent-core and agent-modules are separately maintained repositories/releases that compose the current macOS GuestWeave integration: host SDK library plus guest-side processes. The Windows main implementation at the recorded commit does not import those products. Its similarly named agent is not evidence that it uses core's supervisor or lifecycle protocol.

Windows development branch `feat/weave-agent-handover-168` changes that composition: its host imports the same SDK family and provisions shared core/OS modules in the guest. CLI, REST and MCP exec use its run-supervisor/SDK channel. Architectural convergence is implemented there; full surface parity and release readiness require separate checks. The [migration HLD](windows-development.mdx) distinguishes branch mechanisms from the legacy main baseline above.

## Relationships to other products

HostWeave is an optional orchestrator. Its host-agent runtime adapter drives the local GuestWeave CLI; GuestWeave does not require HostWeave to create or run a VM. The adapter has its own command and companion-capability requirements, which must match the selected CLI version.

Imageweave constructs/prepares image artifacts and can export disks for GuestWeave targets. It also prepares selected core/module release payloads for agent-bearing image tiers. It does not use GuestWeave's CLI as the universal image-build engine or register a VM merely by exporting a disk. The [Imageweave HLD](../imageweave/hld.mdx) separates these operations.

OCI supplies image contracts/tooling. macOS GuestWeave directly uses shared Weave OCI libraries. Windows GuestWeave retains a different VHDX v2 artifact contract and native boot assets. The [compatibility register](../../platform/compatibility.md) records the consequences.

## Consumer contract

Read the HLD for the actual interface path. On macOS, CLI execution uses the guest channel, while HTTP/MCP execution uses SSH; CLI stop defaults to a graceful request, while the inspected HTTP/MCP handlers construct a hard stop. On Windows main, native Linux execution uses the resident module bus and command coverage differs for Windows guests.

A running host process, powered-on VM, authenticated guest channel, installed module and healthy capability are separate conditions. A guide must state which one it waits for. The [reference index](../../reference/index.md) records the distinct contracts.

## Documentation baseline

These designs trace the two private implementation repositories at the source lock. Public prose describes those mechanisms; raw private contracts remain in the companion. Installer-selected releases and checked-in binaries can differ from the inspected source, and host/guest combinations require separate runtime acceptance.
