---
title: Documentation roadmap
description: Prioritised content milestones following the first architecture release.
product: documentation
audience:
- contributor
- developer
- operator
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- documentation:diagrams/manifest.yaml
- hostweave:pkg/images/vm.go
- imageweave:pkg/delivery/native.go
---

## Milestone 1: architecture

The first release includes the platform map, product HLDs, interface catalogue, compatibility register and interactive diagrams. Each claim follows a recorded source baseline. Public and internal sources have separate publication boundaries.

## Milestone 2: develop and integrate

| Priority | Deliverable | Acceptance |
| --- | --- | --- |
| 1 | Write and test a capability module | SDK/core versions pinned; protocol rejection and lifecycle observed |
| 2 | GuestWeave HTTP and CLI reference by host | Router, request/response and help-output checks |
| 3 | HostWeave HTTP and host-agent reference | Generated contract and streaming/auth boundaries verified |
| 4 | Configuration and compatibility tables | Actual precedence, defaults and supported combinations checked |

## Milestone 3: operate

Add product installation guides, then infrastructure implementation guides covering prerequisites, topology, TLS/authentication, persistent data, startup checks, upgrades, backup, restore and rollback.

Use the actual Docker, packaging and platform-service assets as starting evidence. Test each guide in its intended environment. Keep environment-specific infrastructure and confidential recovery procedures in the private companion.

## Milestone 4: one proven image-to-execution journey

Choose compatible producer and consumer versions, record the artifact digest, and exercise construction through guest readiness and workload completion. Resolve or explicitly constrain the image-format gap before publishing the journey.

AppWeave, SightWeave and the Terraform-provider scaffold remain outside this phase. Expand the knowledge base when their implementation and required workflows are ready for verification.
