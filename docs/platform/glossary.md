---
title: Platform glossary
description: Shared terminology for hosts, guests, images, modules and qualification.
product: platform
audience:
- developer
- operator
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- agent-modules:sdk/modulesdk/module.go
- imageweave:pkg/delivery/native.go
- guestweave-macos:internal/vm/run/guestchannel.go
- guestweave-windows:cmd/weaveagent/modulebus.go
- hostweave:agent/agent.go
- agent-modules:sdk/weaveclient/weaveclient.go
- agent-core:internal/hostserv/hostserv.go
- channels:scripts/promote.sh
- guestweave-windows-development:go.mod
---

| Term | Meaning |
| --- | --- |
| Host | A machine that supplies a runtime and capacity for work |
| Guest | A VM running on a host |
| GuestWeave | Host-specific VM management plus guest payloads, channels and integration features; macOS and Windows compose these differently |
| HostWeave host agent | Physical-host workload executor with its own enrollment/session protocol and runtime supervisor |
| Guest agent core | Guest/device process that verifies and supervises separate capability module executables; used by macOS GuestWeave |
| Windows main resident agent | Repository-owned Linux init/agent or interactive Windows daemon; uses its own framed module bus |
| Host client SDK | Linked agent-modules client library on the physical VM host; authenticates and exchanges capability frames with guest core |
| Capability module | In agent-core, a separate OS executable using SDK lifecycle/host-service RPC; Windows main's local Go registry has different semantics |
| Host services | Services core supplies as a module's runtime host, inside the guest/device; these do not run on the physical VM host |
| Image construction | Producing VM image artifacts from reviewed inputs |
| Runtime acceptance | Observed boot, identity, capability and trust results for the exact candidate and acceptance profile |
| Qualification | Status supported by the required evidence; a construction-only result can remain unverified |
| Candidate publication | Registry upload and attestations for a candidate; separate from release-channel promotion |
| OCI artifact | Registry-transported content described by media types and digests |
| Release channel | Versioned promotion data declaring selected versions and digests; signing is conditional, and core consumption requires a verified signed bundle |
| Source baseline | An exact implementation commit used to verify documentation |
| HLD | High-level design: responsibilities, components, interfaces and boundaries |

Use the complete agent role in a diagram or operational instruction. Use qualification for observed runtime evidence, rather than as a synonym for a successful image build.
