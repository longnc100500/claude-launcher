# Claude Desktop Profiles

> Run multiple isolated Claude Desktop profiles — each with its own sessions, MCP servers, and preferences.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)
![Electron](https://img.shields.io/badge/electron-42-blue)
![License](https://img.shields.io/badge/license-ISC-green)

---

## What it does

Claude Desktop stores everything — sessions, cookies, MCP server configs, preferences — in a single user directory. That means one account, one session, one workspace.

**Claude Desktop Profiles** lets you create multiple profiles, each completely isolated from the others. Switch between a personal account and a work account, or run separate MCP environments per project — no conflicts, no cross-contamination.

Each profile gets its own home directory. Claude Desktop Profiles starts Claude Desktop with that directory as its home, so isolation is total and update-safe. The Claude Desktop binary is never modified.

---

## Features

- **Multiple profiles** — create, rename, and delete profiles with emoji icons
- **Full isolation** — separate sessions, cookies, MCP configs, and preferences per profile
- **Auto-detect Claude Desktop** — finds the binary automatically on macOS, Windows, and Linux
- **Live status** — see which profiles are currently running
- **System tray** — minimize to tray, toggle the window, quit from anywhere
- **Keyboard shortcuts** — `Cmd/Ctrl+N` to create, `Cmd/Ctrl+,` for settings, `Escape` to close dialogs

---

## Download

Go to [Releases](../../releases) and download the installer for your platform:

| Platform | File |
|----------|------|
| macOS | `Claude.Desktop.Profiles-x.x.x.dmg` |
| Windows | `Claude.Desktop.Profiles.Setup.x.x.x.exe` |
| Linux | `Claude.Desktop.Profiles-x.x.x.AppImage` |

### ⚠️ macOS — app is not signed

Because this app is not yet code-signed, macOS Gatekeeper will block it on first launch. To open it:

**Option 1 — Right-click method (recommended)**
1. Open **Finder** and locate `Claude Desktop Profiles.app` in `/Applications`
2. **Right-click** (or Control-click) the app → **Open**
3. Click **Open** in the dialog that appears
4. The app will open and macOS will remember your choice for future launches

**Option 2 — System Settings**
1. Try to open the app normally — macOS will block it
2. Open **System Settings → Privacy & Security**
3. Scroll down to the security section — you'll see a message about Claude Desktop Profiles being blocked
4. Click **Open Anyway**

**Option 3 — Terminal (one-time command)**
```bash
xattr -dr com.apple.quarantine /Applications/"Claude Desktop Profiles.app"
```

---

## How it works

Claude Desktop Profiles spawns Claude Desktop with the `HOME` environment variable overridden to a profile-specific directory:

```
spawn(claudeBinaryPath, [], {
  env: { ...process.env, HOME: profile.homeDir }
})
```

Claude Desktop naturally reads and writes all its data under `HOME`, so each profile is silently isolated. No patching. No binary copying. Safe across Claude Desktop updates.

On **Windows**, the launcher sets `USERPROFILE` and `APPDATA` instead of `HOME`.

### ⚠️ Windows login — use email + verification code

When signing in to a profile on Windows, **do not use "Continue with browser"**. The browser redirect opens Claude's auth flow in your default browser and completes the login in the system-level Claude session — not in the isolated profile you launched.

Instead, choose **"Sign in with email"** and use the verification code method. This keeps the entire auth flow inside the isolated profile window and ensures the session is correctly tied to that profile.

---

## Build from source

**Prerequisites:** Node.js 20+, pnpm 9+

```bash
git clone https://github.com/longnc100500/claude-desktop-profiles.git
cd claude-desktop-profiles
pnpm install

# Development
pnpm dev

# Build installer
pnpm build:mac     # macOS (.dmg)
pnpm build:win     # Windows (.exe) — requires Wine or a Windows machine
pnpm build:linux   # Linux (.AppImage, .deb)
```

> **Windows builds on Apple Silicon** require Rosetta 2:
> ```bash
> softwareupdate --install-rosetta --agree-to-license
> ```

---

## Finding the Claude Desktop binary

Claude Desktop Profiles auto-detects the binary on most systems. If it fails, set the path manually in **Settings**.

| Platform | Default location |
|----------|-----------------|
| macOS | `/Applications/Claude.app/Contents/MacOS/Claude` |
| Linux | `/usr/bin/claude` or `/opt/Claude/claude` |
| Windows | See below |

**Windows — finding the path:**
1. Open Claude Desktop, then open **Task Manager**
2. Find **Claude** in the list → right-click → **Open file location**
3. Copy the full path to `claude.exe`, e.g.:
   ```
   C:\Program Files\WindowsApps\Claude_1.x_x64__xxx\app\claude.exe
   ```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Desktop runtime | Electron |
| UI | React + TypeScript |
| Build | Vite (electron-vite) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Packaging | electron-builder |
| Storage | electron-store |
| Validation | Zod |
| Tests | Vitest |

---

## License

ISC
