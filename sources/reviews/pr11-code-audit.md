# PR11 implementation audit

Reviewed on 2026-10-11 against eight exact main commits, the Windows development commit and its selected SDK release in [the source lock](../sources.lock.yaml). Three independent reviewers traced macOS GuestWeave, Windows GuestWeave, and HostWeave/Imageweave; the coordinating review traced agent-core/modules and reconciled shared pages and diagrams. The Windows migration received a second review against both implementations. Complete pinned trees were used to trace dispatch, transport, handlers, install inputs and publication workflows. Repository documentation, comments and upstream acceptance narratives were not treated as implementation proof.

## Corrected relationships and design claims

| Finding | Corrected documentation | Key implementation evidence |
| --- | --- | --- |
| GuestWeave was reduced to host VM management, obscuring guest integration | macOS host SDK and guest core/module payloads are explicit parts of the stack; their locations and independent release pins are documented | macOS `go.mod`, `internal/vm/run/guestchannel.go`, `internal/vm/guestagent/{packages,windows}.go` |
| Windows main was treated as another consumer of the shared core/modules | Main uses repository-owned guest binaries, a local Go module registry and its own framed bus; a supplied SSH tool is another path | Windows main `cmd/weaveagent/modulebus.go`, `cmd/weaveguestd/main.go`, `internal/guestweaveagent/proto/proto.go`, `internal/command/commands_agent.go` |
| Main alone obscured the Windows migration | The separately pinned development branch replaces those agents with a host SDK client, guest core and separate modules; CLI/REST/MCP exec use that channel | Windows development `go.mod`, `internal/guestchannel/channel.go`, `internal/command/{run_channel,commands_exec}.go`, `internal/serve/vmcreate.go` |
| macOS backend descriptions followed stale names/comments | macOS/Linux use Virtualization.framework; Windows-on-mac uses an in-process Hypervisor.framework VMM | macOS `internal/vm/run/{session,windows}.go`, `internal/hypervisor/hypervisor.go` |
| CLI/API operations were described as equivalent | macOS CLI exec uses the SDK/core channel, HTTP/MCP exec uses SSH; stop policy also differs | macOS `internal/command/{commands_exec,commands_stop}.go`, `internal/httpapi/{guest,vms}.go`, `internal/mcp/server_mcp.go` |
| Core's host services lacked process placement and trust semantics | Services run beside core inside the guest/device; local launch-token gRPC and external authenticated frames have different purposes | core `internal/hostserv/hostserv.go`, `internal/supervise/launch.go`, `internal/transport/hypervisor_auth.go` |
| Lifecycle, server liveness and capability health were conflated | Listener/launch/Init/Start order, session waiting, readiness-marker limits, rich/default health and operation acceptance are distinguished | core `internal/supervise/{launch,supervisor}.go`, `internal/lifecycle/lifecycle.go`; SDK `sdk/modulesdk/lifecycle.go`, `sdk/weavemodule/module.go` |
| HostWeave looked like a single GuestWeave execution path | Control-plane persistence/queue/providers and separate enrolled host agent are described; configured QEMU, Moby and opt-in host exec are included | HostWeave `internal/app/app.go`, `agent/agent.go`, `internal/cli/agentcmd/{vms,containers}.go` |
| Companion CLI integrity was unconditional | HostWeave checks the CLI SHA-256 only when configured | HostWeave `agent/runtime/guestweave/guestweave.go` |
| HostWeave/Windows compatibility was merely pending acceptance | Both Windows baselines lack HostWeave's required `capabilities` command; the Windows driver is marked unhealthy | HostWeave `agent/runtime/guestweave/{capabilities,guestweave}.go`; both Windows `internal/cli/root.go` |
| Imageweave construction was shown as GuestWeave orchestration | Native builders call platform libraries directly; SDK/release payloads, target disk exports and consumer admission are separate relationships | Imageweave `pkg/nativebuild/build.go`, `internal/imagebuild/{packages,export}.go` |
| All Imageweave outputs were treated as agent-bearing or construction-only | Base/prepared profiles are agent-free; derived agent inputs, runtime validators and guarded macOS base candidate publication have separate entrypoints | Imageweave `internal/imagebuild/macos/{prepared,acceptance}.go`, `.github/workflows/macos-candidate.yml` |
| Artifact transport implied cross-product compatibility | Shared raw-sector OCI, Windows VHDX v2 and HostWeave metadata formats remain distinct; Windows native boot assets are separate from its pushed disk | OCI `pkg/spec/mediatypes.go`; Windows `internal/oci/oci.go`; HostWeave `pkg/images/vm.go` |
| Clone/publication trust checks were generalised | macOS local template clone checks do not establish that OCI push seals or scrubs the guest disk | macOS `internal/command/{commands_clone,commands_push}.go`, `internal/imagesource/oci/{push,profile}.go` |
| Promotion implied a signed, consumable update feed | Signing is conditional; current module entries contain OCI references, while stock core requires a signed HTTP bundle and HTTP artifact URLs | channels `scripts/promote.sh`, `.github/workflows/promote.yml`, `channels/stable.json`; core `internal/lifecycle/lifecycle.go` |

The six existing product HLDs and new Windows development HLD explain component ownership, actual request paths, lifecycle/readiness, state/artifacts, trust, failures and evidence scope. Seven existing product/platform diagrams were replaced or corrected, and the Windows development diagram was added. The platform overview, GuestWeave overview, compatibility register, glossary and reference index use the same relationships.

## Windows development baseline

The active agent handover is [Windows PR170](https://github.com/weaveplatform/guestweave-cli-windows/pull/170), branch `feat/weave-agent-handover-168`, pinned at `651ec7d5d0459ece11526c5ee34e0774bc6d2f52`. Its host SDK `v0.2.7` resolves independently to `0a61d653a0fd80e3befcb0b65d6b52171d36aad4`. This is implemented architectural convergence on an unmerged branch, not a released parity claim.

The [development HLD](../../docs/products/guestweave/windows-development.mdx) traces the owner-only supervisor pipe, authenticated HvSocket channel, reconnect/reauthentication, package resolution and verification, native systemd boot, operation defaults, upgrades, seal/clone and OCI transport. Static review found remaining limits:

- HostWeave's companion `capabilities` command remains absent.
- SDK `v0.2.7` omits core condition from its registry snapshot; serializing it cannot recover the discarded degraded-core field.
- Upgrade success checks versions rather than module health; missing modules are not selected. Windows installer success can mask per-package failure.
- Fedora's unattended path lacks the agent bundle, and generic Linux bootstrap uses Debian packages.
- OCI push retains a disk/config contract without automatic sealing, guest trust scrubbing, native kernel packaging or UEFI boot-state portability.
- Windows REST/MCP exec uses the SDK, whereas inspected macOS REST/MCP uses SSH. Transport convergence does not establish identical authentication, lifecycle defaults or binary streaming.

Source refresh now resolves each entry's declared branch or tag, preserving these separate baselines rather than comparing all entries to main.

## Source and artifact gaps that remain

- **Imageweave default agent inputs:** the checked-in package lock lacks required signed module checksums; Linux module installers are also absent. `RequirePackages` rejects those inputs before default preparation/agent construction. This does not establish whether upstream releases have the required assets.
- **Windows main embedded native agent:** Go build metadata reports revision `3c7d4dfe09303bceea9d30801af5730d164929dd` and `vcs.modified=true`, rather than the inspected product revision. The checked-in binary's SHA-256 is registered separately; current source is not proof of that payload's behaviour. The development migration removes this payload.
- **Installed release baselines:** macOS host SDK, guest installers, generated protocol source and channel verification tooling select different versions. No platform-wide version or release-binary equivalence is asserted.
- **Consumer acceptance:** no real-machine product build, VM boot, module operation, API acceptance, registry publication or cross-product workload was performed for this audit. Runnable guides still require exact artifact and environment acceptance. Format admission and native boot prerequisites must be checked independently.

## Reviewable evidence

The source lock contains 232 inspected, checksummed files across ten immutable baselines in eight repositories. Their hashes were checked against the complete pinned trees. All 48 pinned product-source links in the site documentation resolve to registered paths at the declared commits, and their line anchors fall within the source files. Those checks establish reference integrity; reviewers still assess whether each claim follows from the implementation.

Private source is represented by paths/checksums and reviewed public explanations. Raw private contracts and payloads were not added to this public repository. Public publication review remains part of PR review.

Diagram delivery and browser receipts, actual screenshots and site verification results are retained as build artifacts. Automated diagram checks establish artifact/containment behaviour; image review separately assesses legibility and composition. See the PR validation results for the final head commit.
