---
title: Compatibility and known gaps
description: Track verified integration boundaries without treating intended architecture
  as runtime support.
product: platform
audience:
- developer
- operator
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- oci:pkg/spec/mediatypes.go
- hostweave:pkg/images/vm.go
- guestweave-windows:internal/oci/oci.go
- imageweave:pkg/delivery/native.go
- agent-modules:sdk/buf.gen.yaml
---

Compatibility claims apply to an exact source or release baseline, host platform and artifact contract. The table below records inspected code boundaries; its status does not imply a successful real-machine acceptance run.

| Integration | Inspected behaviour | Status |
| --- | --- | --- |
| HostWeave → GuestWeave | VM adapter shells out to the GuestWeave CLI on macOS or Windows | Implemented adapter; runtime combinations require acceptance |
| Imageweave → Weave OCI | Native construction invokes manifest import, packing and deep inspection | Implemented construction handoff |
| Agent core → modules | Version-window negotiation and lifecycle RPC | Implemented protocol boundary |
| Shared OCI images → HostWeave | HostWeave’s parser lists different formats from the shared Weave contract | Compatibility gap; do not claim universal admission |
| Shared OCI images → Windows GuestWeave | Windows OCI code implements GuestWeave VHDX v2 media types | Compatibility gap with shared raw-chunk contract |
| Linux GuestWeave host implementation | No corresponding current repository in the inspected organisation inventory | Outside this documentation baseline |

## Image formats

The shared OCI contract defines `application/vnd.weave.guest.config.v1+json` and raw disk chunks. HostWeave’s inspected VM image parser recognises GuestWeave VHDX v2, Tart and Lume media types. Windows GuestWeave’s OCI implementation likewise names the GuestWeave VHDX v2 contract.

These are different formats. Successful registry transport does not prove that a consumer recognises the artifact, can construct a VM from it or can boot it. Before adding an end-to-end guide, exercise the selected producer and consumer versions together and record the artifact digest and runtime evidence.

## Construction and qualification

Imageweave’s native `Construction` result deliberately carries no runtime acceptance field. Its plan can be unverified. Inspection establishes artifact structure; qualification must independently establish the required runtime behaviour.

## Protocol versions

The module SDK pins a core release for protocol generation. The release-channel verifier has its own core pin. Do not replace these independent pins with a platform-wide “latest” version.

Evidence: [shared OCI media types](https://github.com/weaveplatform/weaveplatform-oci/blob/2f088490822cf14a5e9b6824bffe07e932753715/pkg/spec/mediatypes.go), [native construction boundary](https://github.com/weaveplatform/imageweave/blob/3f81345846d7c64bc1b9c5f8f38949a02ca462c5/pkg/delivery/native.go), [SDK protocol generation](https://github.com/weaveplatform/weaveplatform-agent-modules/blob/733ce935024428cadafc68957d2d49419c28d4fb/sdk/buf.gen.yaml). Private parser and adapter evidence is retained internally.
