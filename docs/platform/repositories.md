---
title: Repository catalogue
description: The verified Weave organisation inventory and documentation boundaries.
product: platform
audience:
- contributor
- developer
- operator
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- documentation:sources/repositories.yaml
- agent-modules:sdk/buf.gen.yaml
---

The organisation inventory was checked through GitHub on 11 October 2026. It contained 14 repositories. Private visibility is separate from whether a product has consumer-facing documentation.

| Repository | Visibility | Documentation role |
| --- | --- | --- |
| [weaveplatform-agent-core](https://github.com/weaveplatform/weaveplatform-agent-core) | public | product |
| [weaveplatform-agent-modules](https://github.com/weaveplatform/weaveplatform-agent-modules) | public | product |
| [hostweave](https://github.com/weaveplatform/hostweave) | private | product |
| [guestweave-cli-macos](https://github.com/weaveplatform/guestweave-cli-macos) | private | product |
| [guestweave-cli-windows](https://github.com/weaveplatform/guestweave-cli-windows) | private | product |
| [imageweave](https://github.com/weaveplatform/imageweave) | public | product |
| [weaveplatform-oci](https://github.com/weaveplatform/weaveplatform-oci) | public | dependency |
| [weaveplatform-release-channels](https://github.com/weaveplatform/weaveplatform-release-channels) | public | dependency |
| [weaveplatform.run](https://github.com/weaveplatform/weaveplatform.run) | public | documentation |
| [weaveplatform-docs](https://github.com/weaveplatform/weaveplatform-docs) | public | deprecated-scaffold |
| [weaveplatform-template](https://github.com/weaveplatform/weaveplatform-template) | private | tooling |
| [appweave](https://github.com/weaveplatform/appweave) | private | deferred |
| [sightweave](https://github.com/weaveplatform/sightweave) | private | deferred |
| [terraform-provider-hostweave](https://github.com/weaveplatform/terraform-provider-hostweave) | private | scaffold |

Initial product coverage is GuestWeave, HostWeave, Imageweave, agent-core and agent-modules. OCI and release channels appear as dependencies. The private companion repository is provisioned as part of this documentation implementation; it is an addition to this discovery baseline.

Older local API/SDK checkouts use previous repository identities. They are not the current protocol or SDK authorities. The old `weaveplatform-channels` GitHub identity redirects to `weaveplatform-release-channels`.

The original documentation scaffold also named products and a Linux GuestWeave implementation absent from this organisation inventory. Those names do not establish a current implementation or supported workflow.
