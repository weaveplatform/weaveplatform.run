---
title: Public contract catalogue
description: Download checksummed contracts from the pinned public-source baseline.
product: platform
audience:
- developer
- operator
owner: ShocOne
status: code-inspected
verified_at: '2026-10-11'
evidence:
- agent-core:schema/module-manifest.schema.json
- agent-core:schema/channel-manifest.schema.json
- oci:pkg/spec/schema/vm-config-v1.schema.json
- agent-core:proto/weave/agent/v1/module.proto
---

These snapshots originate from public repositories and are checked against the source-lock checksums on every build. Changes belong upstream; update the pin, snapshot and documentation together after reviewing the implementation.

| Contract | Snapshot | Owning source |
| --- | --- | --- |
| Module manifest | [JSON schema](/contracts/module-manifest.schema.json) | Agent core |
| Release channel | [JSON schema](/contracts/channel-manifest.schema.json) | Agent core |
| VM artifact configuration | [JSON schema](/contracts/vm-config-v1.schema.json) | Weave OCI |
| Module lifecycle | [Protobuf](/contracts/module.proto) | Agent core |
| Module handshake | [Protobuf](/contracts/handshake.proto) | Agent core |
| Module registry | [Protobuf](/contracts/registry.proto) | Agent core |

The protobuf snapshots are reference downloads. They may import other protocol files; they are not distributed here as a standalone compilation bundle. Use the pinned owning repository for code generation.

Schema validation alone does not prove parser, verifier or runtime acceptance. Treat the [compatibility register](../platform/compatibility.md) as part of any integration decision.
