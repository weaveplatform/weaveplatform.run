# Project Title: Weave Platform

## Platform tier
weaveplatform-api
├── proto/                  # gRPC IDL
│   ├── agent/v1/           #   core ↔ module: handshake, host services, lifecycle
│   ├── guestweave/v1/      #   per-service RPC surfaces
│   ├── hostweave/v1/
│   └── gateweave/v1/
├── openapi/                # REST surfaces (generated from proto where they overlap)
│   ├── guestweave.yaml
│   └── hostweave.yaml
├── events/                 # event envelopes, topic definitions
├── schemas/                # shared domain types: Device, Session, Identity, Error, AuthClaims
├── gen/go/                 # generated Go — the only thing consumers import
└── buf.yaml                # breaking-change detection in CI

weaveplatform-sdk
├── errors/                 # structured error taxonomy
├── log/                    # slog conventions, redaction
├── config/                 # schema, precedence, validation
├── retry/                  # backoff, circuit breaker
├── platform/               # seam over go-bindings-*: capability-shaped, not API-shaped
│   ├── platform_darwin.go
│   ├── platform_windows.go
│   └── platform_linux.go
└── module/                 # module scaffolding: Module iface, Host client, serve loop

weaveplatform-agent
├── cmd/
│   ├── weaveboot/          # supervises core; only thing launchd/SCM starts
│   ├── weaveagentd/        # core daemon (root/SYSTEM) — Zone A, CGO_ENABLED=0
│   ├── weaveagent/         # CLI, thin client over local socket
│   └── weaveportal/        # user-session UI — Zone B, AppKit/WinUI3
├── internal/
│   ├── identity/           # device identity, attestation, TPM/Secure Enclave, enrolment
│   ├── transport/          # GateWeave channel; vsock/HvSocket when guest
│   ├── policy/             # fetch, verify, evaluate, notify
│   ├── store/              # namespaced, encrypted at rest
│   ├── supervisor/         # spawn, verify signature, privilege drop, health, swap, drain
│   ├── capability/         # host probe; gates module launch
│   ├── lifecycle/          # fetch, stage, promote, N-1 rollback
│   ├── ui/                 # surface brokerage — core never draws
│   └── bus/                # module event fan-out
├── template/               # scaffolding for a new product module
└── packaging/              # pkg, MSI, deb — the immutable install footprint

weaveplatform-manifest
├── channels/               # signed: which module versions constitute a known-good set
│   ├── stable.json
│   ├── beta.json
│   └── pinned/             #   self-hosted, mapped to service versions
└── keys/                   # signing chain, rotation policy

## Product tier
<product_name>weave
├── cmd/<product_name>weave/# the service
├── internal/               # the internal components of the product
├── agent/                  # module binary — ships and versions with the product
│   └── cmd/<product_name>weave-agent/
├── sdk/                    # client library for this service
└── api/                    # surfaces used by nobody else (shared ones → weaveplatform-api)

appweave         deviceweave      labweave        remoteweave      sightweave
   ├─ agent/        ├─ agent/        ├─ agent/       ├─ agent/         ├─ agent/

gateweave        hostweave                          # server-side only, no module

guestweave       ├─ agent/
guestweave-macos                    # Virtualization / Hypervisor.framework
guestweave-windows                  # HCS
guestweave-linux                    # libvirt

## guestweave
### product description: 
a cli tool for guest vm management. Not bare metal, but a vm manager for guest vm management.
3 seperate vm mangers exist covering linux, windows and macos hosts. 
linux can run linux on linux and windows on linux. 
macos can run mac on mac, linux on mac and windows on mac. 
windows can run windows on windows and linux on windows.

Windows engine is built upon hcs. macos engine is built on virtualization.framework for macos and linux 
and Hypervisor.framework for windows. linux engine is built upon libvirt.
vm's can run headless and headed for all guest/vm combinations. All cli operations are exposed via a restful api.

supports commands like create, start, stop, restart, migrate, clone, snapshot, suspend, migrate, prune and delete 
guest vms. Additionally it supports the ability to run multiple guest vms on the same host.
macOS images are provisioned from a apple CDW supplied IPSW. Windows images are provisioned from a microsoft CDN. 
Linux images are provisioned from a linux distribution CDN. Remote commands are supported for all guest vms, such 
as resolve ip, ssh, login, logout and restart. All OS install options can be driven either as attended (via the ui) 
or unattended using OS specific kickstart tools or keypress scripts.

A basic ui is provided to allow for the management of guest vms as well. But tool is primarily expected to be used via the cli.

## hostweave
### product description:
a fleet scheduler for guest vms. not a hypervisor and not a vm manager, but the layer above 
guestweave that decides where work runs. hosts run a guestweave agent module and poll for work, so 
outbound connections only and cloud hosts behind nat, racked machines and roaming laptops all 
participate the same way. all operations are exposed via a restful api and a cli.

work is submitted declaratively as a spec and reconciled, not driven as imperative commands. 
three workload kinds exist. jobs run to completion and return an exit code and artefacts. sessions 
are held by a person, a cua or a service until released or expired. services stay up and are 
restarted on failure. a spec declares image, resources, lifetime, disposal, network isolation and 
what to expose. disposal defaults to destroy and cannot be set to reuse after agentic execution.

placement is a constraint solver rather than bin packing because the guest matrix is asymmetric. 
macos guests run only on apple hardware, apple silicon runs arm64 windows only, and no more than 
two macos guests may run on one host. hosts advertise what they can run rather than being configured 
for it. affinity, anti-affinity, spread and pack, reservations, priority classes and preemption are 
all supported. a queue with per-tenant fairness, ageing and visible position handles contention.

images are content addressed and built once centrally using the unattended install paths guestweave 
already supports, then cached per host and fast cloned on instantiation using apfs clonefile, 
differencing disks or qcow2 backing files. warm pools are kept per image spec and autoscaled on 
queue depth. time to ready is the metric the product is designed around, measured in seconds rather 
than the tens of minutes a cdn provisioned install costs.

guardrails are enforced outside the guest where the workload cannot reach them. network allowlists 
are applied at the virtual switch, the kill switch is vm destruction, session recording is captured 
host side, the audit stream leaves over the hypervisor channel before the guest sees it, and 
snapshot rollback is the final containment rung. run context is attested by the host and delivered 
inward rather than read locally.

leases, quotas and rbac scope everything to teams and projects, with macos slots counted separately 
because they are the scarcest resource. cloud burst extends local capacity when it is exhausted, 
with per archetype cost attribution. reconciliation is continuous, so draining a host evacuates it, 
a failed host reschedules its work and migration uses the verb guestweave already has.

hostweave knows nothing about hcs, virtualization.framework or libvirt. it speaks specs and leases, 
and translating those into guestweave calls is the host agent's job.
