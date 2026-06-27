# Prompt: Fix a Bug

> Use this prompt when debugging and fixing a bug in Claude Launcher.

---

## Instructions for Claude Code

You are a Staff Software Engineer debugging and fixing a bug in the **Claude Launcher** project.

### Step 1 — Read mandatory documentation

```
1. CLAUDE.md               → coding rules, architecture rules
2. docs/CONTEXT.md         → project state
3. docs/ARCHITECTURE.md    → understand layer boundaries to trace the bug
```

### Step 2 — Understand the bug

Before writing any code, answer these questions:

1. **What is the symptom?** — What does the user see that is wrong? What is the error message?
2. **When does it occur?** — Specific steps to reproduce
3. **When does it NOT occur?** — To understand the scope
4. **What is the expected behavior?**
5. **When did this bug first appear?** — After which PR?

### Step 3 — Reproduce

Before fixing, **reproduce the bug** in the development environment:

```bash
pnpm dev
# Perform the steps to reproduce
# Confirm the bug occurs
```

If the bug cannot be reproduced, more information is needed from the user.

### Step 4 — Root Cause Analysis

**Trace through the layers:**

```
Bug symptom (UI/behavior)
    ↓
Renderer component? Hook? IPC call?
    ↓
Preload API? IPC channel?
    ↓
Main process IPC handler? Validation?
    ↓
Service? Business logic?
    ↓
Repository? Storage?
    ↓
Infrastructure? Filesystem? Child process?
```

**Questions to narrow down:**

- At which layer does the error occur? (check console logs, main process logs)
- Is the input to that layer correct?
- Is the output from that layer correct?
- Is there a race condition? (missing async/await?)
- Is there an unhandled null/undefined?
- Is there a missing validation step?

**Check recent changes:**

```bash
git log --oneline -20                    # Recent commits
git diff HEAD~5 -- src/services/        # Changes in services
git blame src/services/launchService.ts  # Who changed what recently
```

### Step 5 — Write a Failing Test First

Before fixing, write a test that captures the bug:

```typescript
// This test MUST FAIL before the fix
it('should [describe the bug scenario]', async () => {
  // Arrange — set up the specific conditions that reproduce the bug
  // Act — perform the action that causes the bug
  // Assert — expected behavior (not the buggy behavior)
});
```

Run the test and confirm it fails:
```bash
pnpm test -- --grep "should describe the bug"
```

### Step 6 — Fix

**Fix the root cause, not the symptom.**

Example:
```typescript
// ❌ Symptom fix — hides the bug
if (profile) {
  // But why could profile be undefined here?
}

// ✅ Root cause fix — find out why and fix at the source
// ProfileRepository.findById returns undefined when the store is empty
// Fix: add a proper null check with a meaningful error
const profile = await this.repo.findById(id);
if (!profile) {
  return Err(new ProfileNotFoundError(id));
}
```

**Rules when fixing:**
- Fix only what is directly related to the bug
- Do not refactor unrelated code in the same commit
- Do not add features in a bug fix PR
- Keep the fix minimal — fewer code changes = less risk

### Step 7 — Verify the Fix

```bash
# The test written in step 5 MUST NOW PASS
pnpm test -- --grep "should describe the bug"

# The full test suite must pass (no regressions)
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

Reproduce manually in `pnpm dev` to confirm the fix works.

### Step 8 — Check for Similar Issues

After fixing, look for similar patterns elsewhere in the codebase:

```bash
# Search for similar patterns
grep -r "similar_pattern" src/

# If found, fix all instances in the same PR (note in the commit message)
```

### Step 9 — Document

**`docs/WORKLOG.md`** — add an entry:
```
### Bug Fix: [short description] (YYYY-MM-DD)
- Root cause: [brief explanation]
- Fix: [approach taken]
- Test added: [test name]
```

**`docs/TECHNICAL_DEBT.md`** — if the bug reveals a category of debt:
- Add a debt entry if the bug is a symptom of a deeper systemic issue

### Step 10 — Commit

```bash
git commit -m "fix(scope): short description of what was fixed

Fixes: #[issue-number] (if applicable)
Root cause: [one-line explanation]"
```

---

## Common Bug Patterns & Solutions

### Pattern 1: Race Condition

**Symptom**: Bug occurs intermittently, hard to reproduce.

```typescript
// ❌ Race condition — two concurrent calls
async function launch(profileId: string) {
  const status = await this.getStatus(profileId);
  if (status === 'stopped') {
    await this.startProcess(profileId); // another call may have started by now
  }
}

// ✅ Fix — atomic check-and-set
async function launch(profileId: string) {
  if (this.startingProfiles.has(profileId)) return Err(new ProcessAlreadyRunningError());
  this.startingProfiles.add(profileId);
  try {
    // ...
  } finally {
    this.startingProfiles.delete(profileId);
  }
}
```

### Pattern 2: Missing Error Propagation

**Symptom**: Error occurs but the UI shows nothing, or the app crashes silently.

```typescript
// ❌ Error swallowed
ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, input) => {
  try {
    return await profileService.createProfile(input);
  } catch (e) {
    console.error(e); // Error logged but not returned to renderer
  }
  // Renderer receives undefined
});

// ✅ Fix — return error to renderer
ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, input) => {
  try {
    return await profileService.createProfile(input);
  } catch (e) {
    return Err(new AppError('Unexpected error'));
  }
});
```

### Pattern 3: Stale State in React

**Symptom**: UI does not update after an action, or displays old data.

```typescript
// ❌ No refetch after mutation
const { data: profiles } = useProfiles();
const createProfile = async (input) => {
  await window.claudeApi.profiles.create(input);
  // profiles hook still shows stale data
};

// ✅ Fix — refetch after mutation
const { data: profiles, refetch } = useProfiles();
const createProfile = async (input) => {
  const result = await window.claudeApi.profiles.create(input);
  if (result.ok) {
    await refetch();
  }
};
```

### Pattern 4: Process Not Cleaned Up

**Symptom**: Profiles show as "stopped" but the process is still running.

**Diagnosis**:
```bash
ps aux | grep Claude  # Check if the process is actually running
```

**Fix**: Ensure LaunchService removes the process from the tracking map on exit:
```typescript
process.on('exit', () => {
  this.runningProcesses.delete(profileId);
  this.notifyStatusChange(profileId, 'stopped');
});
```

---

## Debugging Tools

```bash
# Main process logs
# (in development, visible in the terminal running pnpm dev)

# Renderer console
# Electron DevTools → Console tab

# Check running Claude processes
ps aux | grep -i claude

# Inspect what env variables were set for a launch
# Add a temporary log in EnvironmentService and run pnpm dev
```
