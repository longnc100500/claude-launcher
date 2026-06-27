# Context Snapshot — Claude Launcher

> This file allows a new Claude Code session to understand the entire project state in under **1 minute**.
> Update when: milestone changes, features are completed, or architecture changes significantly.

---

## What Is This Project?

**Claude Launcher** is an Electron app that allows running multiple isolated Claude Desktop profiles. Each profile has its own HOME directory, giving it completely separate sessions, cookies, cache, and preferences.

**Core mechanism**: Spawn Claude Desktop with `HOME=/path/to/profile/home` — no patching, no binary copying.

---

## Current Milestone

| Field | Value |
|-------|-------|
| **Milestone** | Pre-development: Documentation complete |
| **Target** | v0.1 MVP |
| **Phase** | Phase 0 ready to begin |
| **Branch** | `main` |
| **Last snapshot** | 2026-06-27 |

---

## Architecture Summary

```
Renderer (React)
    ↓ window.claudeApi (contextBridge)
Preload Script
    ↓ ipcRenderer.invoke
Main Process
    ↓ IPC Handlers
Services (ProfileService, LaunchService)
    ↓ interfaces (IProfileRepository, IFilesystemService)
Repositories + Infrastructure (electron-store, fs, child_process)
```

**Key rules**:
- Renderer has NO direct filesystem access
- Services do NOT import Electron APIs
- IPC messages have Zod validation on both sides
- Dependency direction: Renderer → Main → Service → Repository → Domain

---

## Tech Stack

| | |
|--|--|
| Runtime | Electron |
| UI | React + TypeScript |
| Build | Vite |
| Styling | TailwindCSS + shadcn/ui |
| Packaging | electron-builder |
| Storage | electron-store |
| Validation | Zod |
| Testing | Vitest |
| Package manager | pnpm |

---

## Completed Features

> None yet. Implementation has not started.

---

## Missing Features (To Implement)

See `docs/IMPLEMENTATION_PLAN.md` and `docs/TASKS.md` for full details. Summary:

**Phase 0** (Foundation):
- [ ] Project scaffolding (Electron + Vite + React + TS)
- [ ] Testing infrastructure (Vitest)
- [ ] Domain types and interfaces
- [ ] IPC channel definitions and Zod schemas
- [ ] Utility functions

**Phase 1** (Core Domain):
- [ ] Filesystem service abstraction
- [ ] Profile repository (electron-store)
- [ ] Profile service (business logic)
- [ ] IPC handlers for profiles
- [ ] Preload script and typed API

**Phase 2** (Launch Engine):
- [ ] Binary discovery service
- [ ] Environment service (HOME isolation)
- [ ] Launch service (process lifecycle)
- [ ] IPC handlers for launcher
- [ ] Settings repository

**Phases 3–6** (UI + Packaging): See IMPLEMENTATION_PLAN.md

---

## Known Limitations

1. **macOS Keychain**: Even with a separate HOME, the macOS Keychain may still be shared between profiles. Needs investigation.
2. **Windows paths with spaces**: The HOME path must not contain spaces on some Windows configurations. Requires validation.
3. **No sandboxing beyond HOME**: Only HOME is isolated — network, GPU cache, and system fonts are still shared.
4. **Claude Desktop updates**: If Claude changes how it reads HOME (unlikely but possible), the launcher would need updating.
5. **No process monitoring**: v0.1 has no crash detection or automatic restart.

---

## Current Assumptions

1. Claude Desktop reads `HOME` to determine its data directory — this is the default Electron/Chromium behavior.
2. The user has Claude Desktop installed before using the launcher.
3. Target platforms: macOS (primary), Linux (secondary), Windows (tertiary).
4. Single user per machine — no multi-user concerns.
5. pnpm ≥ 9 and Node.js ≥ 20 for development.

---

## File Structure (Current State)

```
claude-launcher/
├── CLAUDE.md                 ✅ Created
├── docs/
│   ├── ARCHITECTURE.md       ✅ Created
│   ├── IMPLEMENTATION_PLAN.md ✅ Created
│   ├── CONTRIBUTING.md       ✅ Created
│   ├── DECISIONS.md          ✅ Created
│   ├── TASKS.md              ✅ Created
│   ├── WORKLOG.md            ✅ Created
│   ├── CONTEXT.md            ✅ This file
│   ├── TECHNICAL_DEBT.md     ✅ Created
│   ├── RELEASE_PLAN.md       ✅ Created
│   └── prompts/
│       ├── implement-pr.md   ✅ Created
│       ├── review-pr.md      ✅ Created
│       ├── bugfix.md         ✅ Created
│       ├── refactor.md       ✅ Created
│       └── release.md        ✅ Created
└── src/                      ❌ Not yet created (starts at PR-01)
```

---

## Next Action

**For the next Claude Code session:**

1. Read `docs/WORKLOG.md` to check for any tasks in progress
2. Read `docs/TASKS.md` and find the first unchecked task in Phase 0
3. Start with **PR-01: Project Scaffolding**
4. After each task: update WORKLOG.md → update TASKS.md → commit

---

## Key Decisions Made

| Decision | Rationale | ADR |
|---------|-----------|-----|
| HOME isolation (no binary copy) | Update-safe, zero coupling | ADR-002 |
| Service + Repository pattern | Testability, separation of concerns | ADR-003 |
| Zod for IPC validation | Runtime type safety | ADR-004 |
| Business logic without Electron | Testable services | ADR-005 |
| TypeScript strict mode | Quality + AI-friendly | ADR-008 |

See `docs/DECISIONS.md` for the full context of each ADR.
