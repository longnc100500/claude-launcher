# Prompt: Prepare and Execute a Release

> Use this prompt when preparing a new version release of Claude Launcher.

---

## Instructions for Claude Code

You are a Staff Software Engineer preparing a release for the **Claude Launcher** project.

### Step 1 — Read mandatory documentation

```
1. CLAUDE.md                → definition of done, quality gates
2. docs/RELEASE_PLAN.md     → release roadmap, features for this version
3. docs/CONTEXT.md          → current milestone and completed features
4. docs/TASKS.md            → verify all required tasks are done
5. docs/TECHNICAL_DEBT.md   → which debt items block this release
```

### Step 2 — Verify Release Readiness

Check every item in the release checklist:

#### Code Quality
```bash
pnpm test              # All tests pass
pnpm test:coverage     # Coverage thresholds met
pnpm typecheck         # Zero TypeScript errors
pnpm lint              # Zero lint errors
pnpm build             # Production build succeeds
```

#### Feature Completeness
- [ ] All features in the release plan for this version are implemented
- [ ] All acceptance criteria for each PR have been verified
- [ ] No "will do this later" items remain open

#### Bug Status
- [ ] No P0 (critical) bugs open
- [ ] No P1 (high) bugs open
- [ ] P2+ bugs are acknowledged in the release notes if necessary

#### Documentation
- [ ] `docs/CONTEXT.md` reflects the current state
- [ ] `docs/WORKLOG.md` is up to date
- [ ] `CHANGELOG.md` is prepared

### Step 3 — Prepare CHANGELOG

Update `CHANGELOG.md` with the unreleased changes:

```markdown
## [0.1.0] - 2026-XX-XX

### Added
- Profile creation with isolated HOME directory
- Launch Claude Desktop with per-profile isolation
- Stop running profiles
- Launch status indicator (running/stopped)
- Custom Claude Desktop binary path setting
- Basic error handling with user-friendly messages

### Known Limitations
- macOS Keychain may still be shared between profiles
- Auto-update not yet available (coming in v0.2)
- System tray not yet available (coming in v0.2)

### Technical
- Built with Electron, React, TypeScript, Vite
- electron-store for persistence
- Zod for runtime type validation
- Vitest for testing
```

### Step 4 — Version Bump

Update the version number in `package.json`:

```bash
# Check the current version
cat package.json | grep '"version"'

# Bump the version (example: 0.1.0)
pnpm version 0.1.0 --no-git-tag-version
```

Commit the version bump:
```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): bump version to 0.1.0"
```

### Step 5 — Final Build Verification

Build the production artifacts:

```bash
# Build for the current platform
pnpm build

# Verify the build output
ls -la dist/
```

Verify the artifact:
- File size is reasonable (not unusually large)
- App launches successfully
- Core features work in the production build

### Step 6 — Tag the Release

```bash
# Create an annotated tag
git tag -a v0.1.0 -m "Release v0.1.0

First public release of Claude Launcher.
Provides profile isolation for Claude Desktop via HOME directory override."

# Push the tag
git push origin v0.1.0
```

### Step 7 — Create GitHub Release

Create a GitHub Release from the tag:

```bash
gh release create v0.1.0 \
  --title "Claude Launcher v0.1.0" \
  --notes-file RELEASE_NOTES.md \
  dist/Claude-Launcher-0.1.0-mac.dmg \
  dist/Claude-Launcher-0.1.0-mac.zip
```

**Release notes template:**

```markdown
# Claude Launcher v0.1.0

Claude Launcher allows you to run multiple isolated Claude Desktop profiles,
each with its own login session, cookies, and preferences.

## Installation

### macOS
1. Download `Claude-Launcher-0.1.0-mac.dmg`
2. Open the DMG and drag Claude Launcher to Applications
3. Launch Claude Launcher
4. Create your first profile and click Launch

## What's New

See [CHANGELOG.md](CHANGELOG.md) for full details.

## Requirements

- macOS 13+ (Ventura)
- Claude Desktop installed at `/Applications/Claude.app`

## Known Issues

- macOS Keychain may be shared between profiles
- System tray is not yet available (coming in v0.2)

## Feedback

Please report issues at: [GitHub Issues](https://github.com/YOUR_ORG/claude-launcher/issues)
```

### Step 8 — Post-Release

After the release is published:

1. **Update `docs/CONTEXT.md`**:
   - Update Current Milestone
   - Move released features to "Completed Features"
   - Update "Current Phase"

2. **Update `docs/WORKLOG.md`**:
   - Add a release entry
   - Set the next milestone

3. **Update `docs/TASKS.md`**:
   - Mark release tasks as complete
   - Add v0.2 tasks if not already present

---

## Release Checklist — Complete Summary

### Code
- [ ] `pnpm test` — all pass
- [ ] `pnpm test:coverage` — thresholds met
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm build` — build succeeds

### Features
- [ ] All required features implemented
- [ ] Manual testing: happy paths
- [ ] Manual testing: error paths
- [ ] No P0/P1 bugs open

### Documentation
- [ ] `CHANGELOG.md` updated
- [ ] `README.md` has installation instructions
- [ ] `docs/CONTEXT.md` updated
- [ ] `docs/WORKLOG.md` updated

### Release
- [ ] Version bumped in `package.json`
- [ ] Git tag created: `v{VERSION}`
- [ ] GitHub Release created with:
  - [ ] Release notes
  - [ ] Build artifacts
  - [ ] Known limitations section

### Post-Release
- [ ] `docs/CONTEXT.md` reflects the released state
- [ ] Next milestone set in WORKLOG.md

---

## Rollback Plan

If a critical bug is found after release:

1. **Assess severity**: Are users affected? Is there data loss? Is there a security issue?
2. **Communicate**: Update the GitHub Release with a warning note
3. **Fix**: Create a hotfix branch, fix, test
4. **Re-release**: Bump the patch version (e.g., 0.1.0 → 0.1.1)

```bash
git checkout -b fix/hotfix-critical-crash v0.1.0
# Apply the fix
git commit -m "fix(launcher): handle crash when binary path contains spaces"
git push origin fix/hotfix-critical-crash
# PR → review → merge → tag v0.1.1
```

---

## Version Numbering

| Change | Version bump | Example |
|--------|-------------|---------|
| Bug fixes, security patches | PATCH | 0.1.0 → 0.1.1 |
| New features, backward compatible | MINOR | 0.1.0 → 0.2.0 |
| Breaking changes (pre-1.0: any significant change) | MAJOR | 0.x → 1.0 |
