# Release Plan — Claude Launcher

> Release roadmap from MVP to stable v1.0 and beyond.

---

## Release Philosophy

- **Small, frequent releases** — do not accumulate features and ship a large release
- **Stability over features** — do not release with failing tests or known crashes
- **User feedback driven** — features after v0.1 are prioritized based on user feedback
- **Breaking changes** — avoid whenever possible, document clearly when unavoidable

---

## v0.1 — MVP (Minimum Viable Product)

**Target**: After Phase 0–4 is complete (PR-01 through PR-24)
**Goal**: Users can create profiles and launch Claude Desktop in an isolated environment.

### Features

| Feature | Status | PR |
|---------|--------|-----|
| Create profile with a name | Planned | PR-08, PR-19 |
| Delete profile | Planned | PR-08, PR-20 |
| List profiles | Planned | PR-08, PR-18 |
| Launch Claude Desktop with isolated HOME | Planned | PR-11–13 |
| Stop a launched profile | Planned | PR-13 |
| View launch status (running/stopped) | Planned | PR-21–22 |
| Basic user-friendly error messages | Planned | PR-23 |
| Settings: custom binary path | Planned | PR-15, PR-25 |
| macOS packaging (.dmg) | Planned | PR-29 |

### NOT in v0.1

- Auto-updater
- System tray
- Profile icons
- Dark mode
- Keyboard shortcuts
- Linux/Windows packaging
- E2E tests

### v0.1 Quality Gates

- [ ] `pnpm test` passes with ≥ 85% coverage (domain + services)
- [ ] `pnpm typecheck` no errors
- [ ] `pnpm lint` no errors
- [ ] Manual testing: create 3 profiles, launch each, verify isolation
- [ ] Manual testing: Claude Desktop update does NOT break the launcher
- [ ] No known crashes on macOS 13+
- [ ] README with installation instructions

### Release Checklist v0.1

```
- [ ] All PR-01 through PR-24 merged
- [ ] PR-29 (electron-builder) complete
- [ ] CHANGELOG.md created
- [ ] Version bumped: 0.1.0
- [ ] Git tag: v0.1.0
- [ ] GitHub Release created with:
  - [ ] macOS .dmg artifact
  - [ ] Release notes
  - [ ] Known limitations section
```

---

## v0.2 — Stability & Polish

**Target**: 4–6 weeks after v0.1
**Goal**: Smooth UX, better reliability, more platform support.

### Features

| Feature | Status | Notes |
|---------|--------|-------|
| System tray icon | Planned | PR-26 |
| Minimize to tray | Planned | PR-26 |
| Profile icons (predefined set + emoji) | Planned | PR-27 |
| Dark mode | Planned | PR-28 |
| Keyboard shortcuts | Planned | PR-28 |
| Accessibility (ARIA, keyboard navigation) | Planned | PR-28 |
| Structured logging (electron-log) | Planned | DEBT-002 |
| Process cleanup on restart | Planned | DEBT-004 |
| Linux packaging (.AppImage, .deb) | Planned | PR-29 |
| Auto-updater | Planned | PR-30 |
| GitHub Actions CI/CD | Planned | PR-31 |

### v0.2 Quality Gates

- [ ] Test coverage ≥ 90% (domain + services)
- [ ] E2E tests for critical paths
- [ ] Manual testing: macOS, Ubuntu 22.04
- [ ] App tray works correctly
- [ ] Auto-update flow tested end-to-end

---

## v0.5 — Feature Complete Beta

**Target**: 3–4 months after v0.1
**Goal**: Full feature set, ready for broader user testing.

### Features

| Feature | Status | Notes |
|---------|--------|-------|
| Windows packaging (.exe NSIS) | Planned | |
| Windows code signing | Planned | Certificate required |
| macOS notarization | Planned | Apple Developer account required |
| E2E tests (Playwright) | Planned | DEBT-001 |
| Bundle size optimization | Planned | DEBT-007 |
| Crash reporting (local, opt-in) | Planned | DEBT-008 |
| Schema migration system | Planned | DEBT-003 |
| Profile sorting and filtering | Planned | Based on user feedback |
| Profile last-used indicator | Planned | UX improvement |
| Launch on system startup option | Planned | Settings |

### v0.5 Quality Gates

- [ ] Tests run on macOS, Linux, Windows CI matrix
- [ ] Notarized macOS build
- [ ] No known P1+ bugs
- [ ] User feedback from v0.1/v0.2 incorporated

---

## v1.0 — Stable Release

**Target**: 6–9 months after v0.1
**Goal**: Production-stable, well-documented, community-ready.

### Features

| Feature | Status | Notes |
|---------|--------|-------|
| All v0.5 features | — | |
| Profile export/import | Planned | Backup & migrate |
| Profile backup to zip | Planned | |
| Security audit | Planned | External review |
| Localization ready | Planned | DEBT-009 |
| Performance benchmarks | Planned | Startup time < 2s |
| Complete documentation | Planned | API docs, user guide |
| Changelog automation | Planned | semantic-release |

### v1.0 Quality Gates

- [ ] Security audit passed
- [ ] No critical/high vulnerabilities
- [ ] Performance: cold start < 2s on typical hardware
- [ ] Overall test coverage ≥ 90%
- [ ] All platforms (macOS, Linux, Windows) fully tested
- [ ] Documentation complete (README, user guide, API docs)
- [ ] Community contribution guide polished
- [ ] CHANGELOG is accurate and complete

---

## Future Roadmap (Post v1.0)

### v1.x — Extensions

| Feature | Description |
|---------|-------------|
| Multiple app support | Not just Claude Desktop — any Electron app |
| Plugin system | Custom environment setups per profile |
| CLI interface | `claude-launcher start <profile-name>` |
| Profile groups | Organize profiles into folders |
| Profile tags | Tag profiles for filtering |

### v2.0 — Platform

| Feature | Description |
|---------|-------------|
| Cloud sync | Sync profile configs across machines |
| Team profiles | Share profile templates within a team |
| Audit log | Track profile usage and launch history |
| Metrics dashboard | Usage statistics per profile |

---

## Versioning Policy

Uses **Semantic Versioning** (SemVer):

- `MAJOR.MINOR.PATCH` — e.g., `1.2.3`
- `MAJOR` — breaking changes (rare, documented in CHANGELOG)
- `MINOR` — new features, backward compatible
- `PATCH` — bug fixes, no new features

Pre-release: `0.x.y` — API and storage format may change without a MAJOR bump.

### Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, released code |
| `develop` | Integration branch (optional) |
| `feat/pr-XX-*` | Feature branches |
| `fix/pr-XX-*` | Bug fix branches |
| `release/v0.x` | Release preparation branches |

---

## Distribution Channels

| Platform | Format | Channel |
|----------|--------|---------|
| macOS | `.dmg` | GitHub Releases |
| macOS | `.zip` (Sparkle) | GitHub Releases |
| Linux | `.AppImage` | GitHub Releases |
| Linux | `.deb` | GitHub Releases |
| Windows | `.exe` (NSIS) | GitHub Releases |
| All | Auto-update | electron-updater → GitHub |

Homebrew cask and Linux package managers (AUR, snap) will be considered after v1.0.
