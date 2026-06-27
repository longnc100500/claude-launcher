# Prompt: Review a Pull Request

> Use this prompt to review code in a PR — checking correctness, architecture, tests, and documentation.

---

## Instructions for Claude Code

You are a Staff Software Engineer reviewing code for the **Claude Launcher** project.

### Step 1 — Read mandatory documentation

```
1. CLAUDE.md                   → coding rules, review checklist, DoD
2. docs/ARCHITECTURE.md        → architecture rules to verify against
3. docs/DECISIONS.md           → ADRs to understand intentional design choices
4. docs/IMPLEMENTATION_PLAN.md → find the PR being reviewed, read acceptance criteria
```

### Step 2 — Understand the PR

Read the PR description (or what the requester provides) to understand:
- What does this PR implement?
- What are the acceptance criteria?
- Which files were changed?

### Step 3 — Review the Code

Evaluate the code across the following dimensions:

#### A. Correctness

- Does the code correctly implement the PR's acceptance criteria?
- Is the business logic correct?
- Are edge cases handled?
- Do error cases return the correct error type?

#### B. Architecture Compliance

Verify each layer:

**Domain Layer (`src/domain/`)**
- [ ] No imports from Service, Repository, Main, or Renderer
- [ ] Contains only types, interfaces, value objects, errors
- [ ] No I/O operations

**Service Layer (`src/services/`)**
- [ ] No Electron API imports (`electron`, `app`, `ipcMain`, etc.)
- [ ] Dependencies accepted via constructor, not self-created
- [ ] Returns `Result<T, E>` instead of throwing exceptions
- [ ] Business logic is complete — not in IPC handlers

**Repository Layer (`src/repositories/`)**
- [ ] Only CRUD operations
- [ ] No business logic
- [ ] Implements an interface from the domain layer

**Main Process (`src/main/`)**
- [ ] IPC handlers validate input with Zod before calling the service
- [ ] No business logic in handlers
- [ ] No React or DOM API imports

**Preload (`src/preload/`)**
- [ ] Uses `contextBridge.exposeInMainWorld` — does not expose raw `ipcRenderer`
- [ ] Typed API matches the `ClaudeApi` interface

**Renderer (`src/renderer/`)**
- [ ] No imports from `fs`, `path`, `child_process`, or any Node.js module
- [ ] No imports from Electron
- [ ] Only uses `window.claudeApi` to communicate with main

#### C. TypeScript Quality

- [ ] No `any` types
- [ ] All public functions have explicit return types
- [ ] Zod schemas used for external data
- [ ] Branded types used correctly (`ProfileId`, etc.)
- [ ] No implicit returns in functions with non-void return type

#### D. Testing

- [ ] Tests exist for all public methods in Services/Repositories
- [ ] Service tests do not import Electron
- [ ] Test names describe behavior, not implementation
- [ ] Happy path tests present
- [ ] Error case tests present
- [ ] Edge case tests present
- [ ] Coverage meets thresholds (domain/service ≥ 90%, repo ≥ 80%)

#### E. Security

- [ ] `contextIsolation: true` and `nodeIntegration: false` remain unchanged
- [ ] No path traversal vulnerabilities in profile creation
- [ ] User input is validated with Zod before processing
- [ ] No hardcoded secrets or sensitive paths

#### F. IPC Contract

- [ ] Channels use constants from `IPC_CHANNELS` — no magic strings
- [ ] Input schemas validate correctly
- [ ] Response format is consistent with the existing API
- [ ] Preload API types match handler return types

#### G. Error Handling

- [ ] Typed errors are used (not `new Error("message")`)
- [ ] Errors are logged with sufficient context
- [ ] UI shows user-friendly messages (not internal error details)
- [ ] No unhandled promise rejections

#### H. Documentation

- [ ] `docs/WORKLOG.md` has been updated
- [ ] `docs/TASKS.md` has been correctly checked off
- [ ] Commit messages follow Conventional Commits
- [ ] JSDoc for public APIs where necessary

### Step 4 — Report Results

Review report format:

```markdown
## PR Review: PR-XX [PR Title]

### Summary
[2–3 sentence overview of what this PR does and its overall quality]

### ✅ Correct
- [Good point 1]
- [Good point 2]

### ❌ Must Fix (blocking)
1. **[File:Line]** — [Description of the issue and how to fix it]
2. **[File:Line]** — [Description of the issue and how to fix it]

### ⚠️ Should Fix (non-blocking but important)
1. **[File:Line]** — [Description of the issue]

### 💡 Consider (optional improvements)
1. **[File:Line]** — [Suggestion]

### Architecture Compliance
- [x] Dependency direction is correct
- [x] Services do not import Electron
- [ ] ❌ Renderer directly accesses the filesystem at [file:line]

### Test Coverage
- Service coverage: X%
- Repository coverage: X%
- Missing test cases: [list]

### Verdict
[ ] ✅ Approved — ready to merge
[ ] ⚠️ Approved with minor changes — fix and re-request review
[ ] ❌ Changes required — has blocking issues
```

### Step 5 — If blocking issues are found

If the review finds blocking issues:
1. **Do not merge** — list all blocking issues clearly
2. Explain **why** each is a problem (not just "this is wrong")
3. Suggest **specific** fixes
4. Offer to apply fixes inline if requested

---

## Common Issues to Watch For

### Architecture Violations

```typescript
// ❌ Service importing Electron
import { app } from 'electron'; // in src/services/

// ❌ Renderer accessing filesystem
import { readFileSync } from 'fs'; // in src/renderer/

// ❌ Magic string IPC channel
ipcMain.handle('profiles-list', ...); // instead of IPC_CHANNELS.PROFILES_LIST
```

### Type Safety Issues

```typescript
// ❌ any type
function process(data: any) { ... }

// ❌ Non-null assertion without a preceding guard
const profile = profiles.find(p => p.id === id)!;

// ❌ Missing return type
function createProfile(input) { ... }
```

### Missing Validation

```typescript
// ❌ IPC handler does not validate input
ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, input) => {
  return profileService.createProfile(input); // input not validated!
});

// ✅ Correct
ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, rawInput: unknown) => {
  const parsed = CreateProfileInputSchema.safeParse(rawInput);
  if (!parsed.success) return Err(new ValidationError(parsed.error.message));
  return profileService.createProfile(parsed.data);
});
```

### Test Quality Issues

```typescript
// ❌ Test does not test behavior
it('createProfile', async () => {
  const result = await service.createProfile({ name: 'test' });
  expect(result).toBeDefined(); // meaningless
});

// ✅ Better
it('should return ProfileAlreadyExistsError when name is duplicate', async () => {
  // Arrange...
  // Act...
  expect(result.ok).toBe(false);
  expect(result.error).toBeInstanceOf(ProfileAlreadyExistsError);
});
```
