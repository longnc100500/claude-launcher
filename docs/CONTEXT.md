# Project Context — Claude Launcher

> One-minute snapshot for new Claude Code sessions. Read this before reading any code.

---

## What This Project Is

**Claude Launcher** is an Electron desktop app that lets users run multiple isolated Claude Desktop profiles. Each profile gets its own `HOME` directory — completely isolating sessions, cookies, preferences, and MCP server configurations.

**Core mechanism:** `spawn(claudeBinaryPath, [], { env: { ...process.env, HOME: profile.homeDir } })`

No patching. No binary copying. Update-safe by design.

---

## Current State (2026-06-27)

| Field | Value |
|-------|-------|
| **Version** | 0.0.1 (pre-release) |
| **Phase** | All 32 PRs complete — ready for v0.1 packaging |
| **Tests** | 240 passing, 0 failing |
| **Branch** | `main` |

---

## Completed Features

- ✅ Profile CRUD (create, rename, delete with home directory management)
- ✅ Launch/stop Claude Desktop with HOME isolation
- ✅ Auto-detect Claude Desktop binary (macOS/Linux/Windows)
- ✅ Profile list UI with running status badge
- ✅ Create/Edit/Delete dialogs with validation
- ✅ Emoji icon picker for profiles
- ✅ Settings page (binary path + theme)
- ✅ Toast notifications (Sonner)
- ✅ IPC push notifications when process exits
- ✅ Keyboard shortcuts (Cmd+N, Escape, Cmd+,)
- ✅ System tray (toggle window, quit)
- ✅ electron-builder packaging config
- ✅ GitHub Actions CI/CD

---

## Architecture Summary

```
Renderer (React)
  ↓ window.claudeApi (contextBridge)
Preload (typed IPC bridge)
  ↓ ipcRenderer.invoke
Main Process
  ↓ ipcMain.handle → Service → Repository → electron-store / fs
```

**Layer rules (never violate):**
- Renderer: no Node.js or Electron APIs
- Service/Domain: no Electron APIs (testable without Electron)
- Repository: CRUD only, no business logic
- IPC: all messages validated with Zod

---

## Key Files

| File | Purpose |
|------|---------|
| `src/main/index.ts` | Main process entry — wires all services and IPC handlers |
| `src/main/ipc/profileHandlers.ts` | Profile CRUD IPC handlers |
| `src/main/ipc/launchHandlers.ts` | Launch/stop/status IPC handlers |
| `src/services/launchService.ts` | Core launch logic — HOME isolation |
| `src/services/profileService.ts` | Profile business logic |
| `src/repositories/profileRepository.ts` | electron-store persistence |
| `src/preload/index.ts` | Typed API bridge |
| `src/renderer/src/App.tsx` | React root — full UI wired |
| `src/shared/ipc/channels.ts` | All IPC channel names |
| `src/shared/ipc/schemas.ts` | Zod validation schemas |

---

## Known Limitations

- macOS Keychain is shared across profiles (not isolated by HOME)
- No app icon assets yet (required before packaging)
- No system tray icon asset yet (tray silently disabled if missing)
- `publish.owner` in `electron-builder.config.ts` needs updating before first release

---

## Next Steps (v0.2 Roadmap)

1. Add app icon assets (`resources/icon.icns`, `icon.ico`, `icon.png`)
2. Add tray icon asset (`resources/tray-icon.png`)
3. macOS code signing + notarization
4. Auto-updater (`electron-updater`)
5. Launch-on-startup setting implementation
6. Keychain isolation research
