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
---

| Term | Meaning |
| --- | --- |
| Host | A machine that supplies a runtime and capacity for work |
| Guest | A VM running on a host |
| GuestWeave | The host-specific VM manager |
| Host agent | HostWeave’s work-execution process; separate from guest agent core |
| Agent core | The runtime that verifies and supervises capability modules |
| Module | A separately launched capability process using the module protocol |
| Host services | The identity, policy, storage, event and other services core offers to a module |
| Image construction | Producing VM image artifacts from reviewed inputs |
| Qualification | Evidence that a candidate meets the required runtime conditions |
| OCI artifact | Registry-transported content described by media types and digests |
| Release channel | Signed data declaring promoted versions and digests |
| Source baseline | An exact implementation commit used to verify documentation |
| HLD | High-level design: responsibilities, components, interfaces and boundaries |

Use the complete agent role in a diagram or operational instruction. Use qualification for observed runtime evidence, rather than as a synonym for a successful image build.
