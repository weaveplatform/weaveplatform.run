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
sightweave
├── cmd/sightweave/         # the service
├── agent/                  # module binary — ships and versions with the product
│   └── cmd/sightweave-agent/
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
a cli tool guest vm management. can create, start, stop, restart, migrate, snapshot and delete guest vms.
3 seperate vm mangers for linux, windows and macos hosts. linux can run linux on linux and windows on linux. 
macos can run mac on mac, linux on mac and windows on mac. windows can run windows on windows and linux on windows.
Not bare metal, but a vm manager for guest vm management. Windows engine is built upon hcs. macos engine is built
on framework.virtualization for macos and linux and framework.hypervisor for windows. linux engine is built upon libvirt.
can run headless and headed for all guest/vm combinations. exposes all services via a restful api.

## hostweave
### product description:
a host orchestrator for host management. can leverage guestweave to call on the features of the guest vm manager
