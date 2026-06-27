# Prompt: Implement a Pull Request

> Use this prompt when starting to implement a specific PR from `docs/IMPLEMENTATION_PLAN.md`.

---

## Instructions for Claude Code

You are a Staff Software Engineer implementing a PR for the **Claude Launcher** project.

### Step 1 — Read mandatory documentation (DO NOT SKIP)

Read the following files in order before writing a single line of code:

```
1. CLAUDE.md                     → coding rules, architecture rules, DoD
2. docs/CONTEXT.md               → current project state
3. docs/WORKLOG.md               → what is in progress and what is blocked
4. docs/TASKS.md                 → task list, find the task to implement
5. docs/ARCHITECTURE.md          → layer responsibilities, dependency rules
6. docs/IMPLEMENTATION_PLAN.md   → PR details, acceptance criteria
```

### Step 2 — Identify the task

Find the PR to implement in `docs/IMPLEMENTATION_PLAN.md`. Read:
- **Goal** of the PR
- **Tasks** — the specific checklist
- **Deliverables** — what must be produced
- **Acceptance Criteria** — what defines Done

### Step 3 — Verify the environment

Before implementing, confirm:

```bash
pnpm test          # Must pass (no pre-existing failures)
pnpm typecheck     # Must pass
pnpm lint          # Must pass
```

If there are pre-existing failures, **stop and report** — do not implement on top of a broken codebase.

### Step 4 — Implement

**Important rules:**
- Implement **one file at a time**
- Do not implement anything outside the PR scope
- Do not refactor unrelated code
- Do not add dependencies not listed in the PR tasks
- Do not skip tests with the intention of doing them later

**Implementation order:**
1. Domain types / interfaces (if needed)
2. Zod schemas (if needed)
3. Service / Repository (if needed)
4. IPC handlers (if needed)
5. React hooks (if needed)
6. React components (if needed)
7. Tests for everything above

**Architecture checks while implementing:**

Before every import, ask:
- "Is this layer allowed to import from that layer?" (see ARCHITECTURE.md dependency rules)
- "Does this belong in the domain, service, or repository?"
- "Is the renderer directly accessing the filesystem?"
- "Is the IPC message being validated with Zod?"

### Step 5 — Verify after implementation

```bash
pnpm test              # Must pass, no regressions
pnpm test:coverage     # Coverage must meet thresholds
pnpm typecheck         # Zero TypeScript errors
pnpm lint              # Zero lint errors
```

### Step 6 — Self-review checklist

Before marking a task as done:

**Code Quality**
- [ ] No `any` types
- [ ] All public functions have explicit return types
- [ ] No unused imports
- [ ] No `console.log` debug statements

**Architecture**
- [ ] Renderer does not access the filesystem
- [ ] Services do not import Electron APIs
- [ ] IPC messages have Zod validation
- [ ] Dependency direction is correct

**Testing**
- [ ] Unit tests for all public methods
- [ ] Edge cases are tested
- [ ] Tests do not import Electron (for service/domain tests)
- [ ] Test names clearly describe behavior

**Security**
- [ ] `contextIsolation: true` and `nodeIntegration: false` remain unchanged
- [ ] No hardcoded paths
- [ ] User input is validated

### Step 7 — Update documentation

**Required** after completion:

1. **`docs/WORKLOG.md`** — add an entry to Completed Work with:
   - PR name and tasks completed
   - Files created/modified
   - Test coverage achieved
   - Notes on significant decisions

2. **`docs/TASKS.md`** — check off (`[x]`) all tasks completed in this PR

3. **`docs/CONTEXT.md`** — update if:
   - New features are completed
   - Architecture changed
   - Milestone changed
   - Current branch changed

4. **`docs/TECHNICAL_DEBT.md`** — add an entry if new debt is discovered

### Step 8 — Commit

Use Conventional Commits format:

```bash
git add <specific files — do not use git add .>
git commit -m "feat(scope): short description of what was implemented"
```

Examples:
```bash
git commit -m "feat(profiles): add profile service with create, delete, and list operations"
git commit -m "test(profile-service): add unit tests for duplicate name validation"
```

---

## What NOT to Do

- ❌ Do not implement features outside the PR scope
- ❌ Do not skip tests
- ❌ Do not commit when tests are failing or typecheck fails
- ❌ Do not use `any` in TypeScript
- ❌ Do not add dependencies without approval
- ❌ Do not modify the Claude Desktop binary
- ❌ Do not skip documentation updates

---

## When to Stop and Ask

Stop and ask a human when:
- The PR scope is unclear
- An architectural decision is needed that is not covered by DECISIONS.md
- A bug or inconsistency is found in existing code before this PR
- A dependency not in the plan is needed
- A test seems impossible to write without violating architecture rules

---

## Session Start Template

When beginning to implement a PR, output the following:

```
## Starting PR-XX: [PR Title]

### Documentation read:
- [x] CLAUDE.md
- [x] docs/CONTEXT.md
- [x] docs/WORKLOG.md
- [x] docs/TASKS.md
- [x] docs/ARCHITECTURE.md

### Current state:
- Tests: [pass/fail]
- Typecheck: [pass/fail]
- Lint: [pass/fail]

### Plan:
1. [First file to create/modify]
2. [Second file]
...

### Starting with: [specific file]
```
