---
title: Start here
description: Choose a path through the Weave platform knowledge base.
product: platform
audience:
- consumer
- developer
- operator
- contributor
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- hostweave:agent/runtime/guestweave/guestweave.go
- agent-core:internal/core/core.go
slug: /start-here
---

Weave brings together virtual machine management, workload orchestration, image construction and a capability-based agent runtime. This knowledge base explains the responsibilities of those parts and the interfaces between them.

## Choose your starting point

| Your task | Start with |
| --- | --- |
| Understand the whole platform | [Platform architecture](../platform/architecture.mdx) |
| Run or integrate with local VMs | [GuestWeave](../products/guestweave/index.md) |
| Place work across hosts | [HostWeave HLD](../products/hostweave/hld.mdx) |
| Build VM images | [Imageweave HLD](../products/imageweave/hld.mdx) |
| Understand device and guest capabilities | [Agent core](../products/agent-core/hld.mdx) and [agent modules](../products/agent-modules/hld.mdx) |
| Find the contract behind an interface | [Reference index](../reference/index.md) |
| Contribute to this knowledge base | [Documentation workflow](../development/documentation.md) |

## Read the evidence correctly

The initial release focuses on high-level designs. These pages describe inspected implementation at recorded commits on `main`; they do not certify a deployed environment or every host/guest combination. A release tag and an implementation baseline are separate facts.

The [compatibility register](../platform/compatibility.md) names integration limits. Runnable tutorials and infrastructure guides are added when their exact versions and procedures have been exercised. [The roadmap](../development/roadmap.md) records that work.

Public explanations live here. Confidential implementation evidence, environments and operational knowledge belong in the private `weaveplatform.dev` companion repository. A public product page remains public even when its source repository is private.
