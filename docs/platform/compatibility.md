---
title: Compatibility and known gaps
description: Track verified integration boundaries without treating intended
  architecture as runtime support.
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
- agent-modules:.github/agent-core-version
- guestweave-macos:go.mod
- guestweave-macos:internal/vm/guestagent/packages.go
- guestweave-macos:internal/vm/guestagent/windows.go
- guestweave-macos:internal/imagesource/oci/registry.go
- guestweave-windows:internal/guestweaveagent/proto/proto.go
- guestweave-windows:internal/nativebuild/assets/weave-agent
- imageweave:internal/imagebuild/catalogue.go
- imageweave:images/packages.lock.json
- imageweave:internal/imagebuild/export.go
- imageweave:.github/workflows/macos-candidate.yml
- channels:.github/agent-core-version
- guestweave-windows:internal/cli/root.go
- hostweave:agent/runtime/guestweave/capabilities.go
- hostweave:agent/runtime/guestweave/guestweave.go
- channels:scripts/promote.sh
- channels:.github/workflows/promote.yml
- channels:channels/stable.json
- agent-core:internal/lifecycle/lifecycle.go
- guestweave-windows-development:go.mod
- guestweave-windows-development:internal/cli/root.go
---

Compatibility claims apply to an exact source or release baseline, host platform and artifact contract. The table below records inspected code boundaries; its status does not imply a successful real-machine acceptance run.

| Integration | Inspected behaviour | Status |
| --- | --- | --- |
| HostWeave → GuestWeave | VM adapter invokes the selected CLI; companion checks vary by platform/image path | Pinned Windows CLI lacks required `capabilities`; driver is unhealthy. Other combinations need contract checks and acceptance |
| macOS GuestWeave → SDK/core/modules | Host links the SDK; guest installers select independently pinned core and module assets | Source composition established; installed release binaries require separate verification |
| Windows GuestWeave → resident agent | Repository-local client, guest agent and framed module bus | Separate implementation; no dependency on shared agent-core/modules found |
| Windows development → SDK/core/modules | Migration branch replaces the local guest agents and routes exec through the shared SDK | Implemented on the pinned development branch; not current main or a guarantee of full parity |
| Imageweave → Weave OCI | Construction invokes manifest import, packing and deep inspection | Implemented handoff; not runtime qualification |
| Imageweave → GuestWeave disks | Target export writes raw or VHDX disks from a verified layout | Conversion implemented; registration, native boot inputs and acceptance remain consumer-specific |
| Agent core → modules | Version-window negotiation and local gRPC lifecycle; separate external capability wire | Implemented boundaries; lifecycle Protocol `1` alone does not establish host-wire compatibility |
| Shared OCI images → HostWeave | HostWeave’s parser lists different formats from the shared Weave contract | Compatibility gap; do not claim universal admission |
| Shared OCI images → Windows GuestWeave | Windows OCI code implements GuestWeave VHDX v2 media types | Compatibility gap with shared raw-chunk contract |
| Release channels → core module downloads | Promotion entries contain OCI references; stock core downloads artifact URLs through HTTP | Unresolved delivery contract; promotion data is not a directly usable update feed |
| Linux GuestWeave host implementation | No corresponding current repository in the inspected organisation inventory | Outside this documentation baseline |

## Image formats

The shared OCI contract defines `application/vnd.weave.guest.config.v1+json` and raw disk chunks. HostWeave’s inspected VM image parser recognises GuestWeave VHDX v2, Tart and Lume media types. Windows GuestWeave’s OCI implementation likewise names the GuestWeave VHDX v2 contract.

These are different formats. Successful registry transport does not prove that a consumer recognises the artifact, can construct a VM from it or can boot it. Before adding an end-to-end guide, exercise the selected producer and consumer versions together and record the artifact digest and runtime evidence.

## Companion CLI and channel delivery

The pinned Windows CLI has no `capabilities` command. HostWeave invokes that command and marks its Windows driver unhealthy on failure, so these exact baselines have an implementation incompatibility before VM acceptance. macOS fingerprinting tolerates a failed capability query for legacy paths, but resolved-image format/platform admission, resolved OCI pulls and Windows execution enforce additional companion contracts.

The inspected Windows migration branch also lacks that companion command, despite its SDK/core/module convergence. Its new guest architecture does not by itself repair HostWeave admission. See the [development-branch HLD](../products/guestweave/windows-development.mdx).

Release-channel promotion signs only when a signing key is configured. The checked-in stable document has no accompanying signature and its core version/artifact list is empty. Core's channel fetcher instead requires `manifest.json`, `manifest.json.sig`, `signing.pub` and `signing.pub.sig`, verifies them against its root, then downloads selected artifact URLs through its HTTP client. Current promoted module URLs are bare GHCR OCI references with platform fragments, not HTTP download URLs. A serving/resolution and signed-bundle contract is needed before those entries can drive stock core installation. The promotion workflow's success alone proves neither signing nor installability.

## Construction and qualification

Imageweave's native `Construction` result carries no runtime acceptance field. Linux delivery and selected macOS/agent validators have separate runtime acceptance paths. The macOS candidate workflow can publish accepted base artifacts with attestations; that is separate from channel promotion. This documentation review did not execute those paths.

The default `images/packages.lock.json` lacks the signed checksum evidence required for every module, and Linux module entries lack installers. `RequirePackages` rejects this lock before default `image prepare` and agent construction can download or install packages. A reviewed, complete replacement lock is required. This is a finding about checked-in inputs, not evidence that upstream release assets are missing. See the [Imageweave HLD](../products/imageweave/hld.mdx).

Windows GuestWeave's native Linux boot directory supplies kernel, initrd and manifest separately from its VHDX. The OCI push path does not package that directory. A transferred disk alone therefore does not establish a portable native guest.

macOS GuestWeave enforces sealed template trust rules in local clone paths, but its inspected OCI push copies the raw disk without performing that sealing/trust check or scrubbing guest trust. A new host-side key after pull is not proof that the published guest disk is free of prior trust or state. Review the [macOS image/trust paths](../products/guestweave/macos.mdx) before defining a publication procedure.

## Independent version baselines

| Input | Inspected pin | Meaning |
| --- | --- | --- |
| macOS GuestWeave host SDK | `v0.2.7` | Linked host client; separately locked from SDK main |
| Windows development host SDK | `v0.2.7` | Same selected SDK release; guest core/modules resolve stable releases dynamically |
| macOS guest core installer | `0.9.8` | Selected macOS payload |
| Windows-on-mac core installer | `0.9.11` | Selected Windows payload in the macOS implementation |
| Module SDK protocol generation | core `v0.9.2` | Source for its generated lifecycle/host-service protobuf copy |
| Release-channel verification tooling | core `v0.9.9` | Independent verifier pin |

Module releases have additional OS-specific pins, recorded in the [macOS HLD](../products/guestweave/macos.mdx). These are installer/dependency declarations, not proof that downloaded binaries behave like the independently locked current source. Verify lifecycle windows, external framing, capability vocabulary and actual installed assets together.

Windows GuestWeave's checked-in native Linux agent reports build revision `3c7d4dfe09303bceea9d30801af5730d164929dd` and `vcs.modified=true`, while its inspected source is `48fe4242d4d8b884e1bc464287f9a6c8f72ca275`. Current source cannot certify that embedded payload. The [Windows HLD](../products/guestweave/windows.mdx) records its build metadata and the runtime checks still needed.

Evidence: [shared OCI media types](https://github.com/weaveplatform/weaveplatform-oci/blob/2f088490822cf14a5e9b6824bffe07e932753715/pkg/spec/mediatypes.go), [native construction boundary](https://github.com/weaveplatform/imageweave/blob/3f81345846d7c64bc1b9c5f8f38949a02ca462c5/pkg/delivery/native.go), [SDK protocol generation](https://github.com/weaveplatform/weaveplatform-agent-modules/blob/733ce935024428cadafc68957d2d49419c28d4fb/sdk/buf.gen.yaml). Private parser and adapter evidence is retained internally.
