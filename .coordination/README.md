# MusicHub Coordination Control Plane

This directory is the machine-readable control plane for multi-stream execution.

Rules:
- Codex UI threads are not the source of truth.
- Chief instructions must be mirrored into stream inbox files here.
- Stream acknowledgements and completion reports must be written back here.
- CI validates these files on managed stream branches.

Structure:
- `config.json`
  - stream registry and branch/worktree mapping
- `releases/<release>.json`
  - active release registry and program-doc mapping
- `chief/queue.json`
  - active and historical task records
- `streams/<stream>/state.json`
  - current stream status
- `streams/<stream>/inbox.json`
  - Chief-to-stream instruction records
- `streams/<stream>/outbox.json`
  - stream-to-Chief acknowledgement/progress/completion records

Primary commands:
- `npm run coord:assign -- --stream runtime --title "Clip context-menu parity"`
- `npm run coord:ack -- --stream runtime --summary "Read handover and starting work"`
- `npm run coord:report -- --stream runtime --status completed --summary "Task done"`
- `npm run coord:check-in`
- `npm run coord:check-out`

Enforcement:
- `npm run check:streams`
- `.github/workflows/stream-protocol-check.yml`

Release-managed work:
- every release task must reference a release ID
- release tasks must map to requirement IDs and defect IDs when applicable
- release tasks must map to validation test IDs when applicable
- `R1 Studio Baseline` is currently registered in:
  - `.coordination/releases/r1-studio-baseline.json`
