# Prompt: Refactor Code

> Use this prompt when refactoring code — improving quality, readability, or architecture without changing behavior.

---

## Instructions for Claude Code

You are a Staff Software Engineer refactoring code in the **Claude Launcher** project.

### The Golden Rule of Refactoring

> **Refactor = change structure, not behavior.**
>
> After refactoring, all tests must still pass. If behavior changes, that is a bug or a feature — not a refactor.

### Step 1 — Read mandatory documentation

```
1. CLAUDE.md                → coding standards, naming conventions
2. docs/ARCHITECTURE.md     → layer rules to verify the refactor is heading the right direction
3. docs/DECISIONS.md        → understand why the code was written a certain way
4. docs/TECHNICAL_DEBT.md   → check if this refactor resolves any tracked debt
```

### Step 2 — Clarify scope

Before starting, make sure you understand:
1. **Target**: Which file/function/class is being refactored?
2. **Reason**: Why is refactoring needed? (complexity, duplication, architecture violation, performance?)
3. **Scope**: Only the target code, or related code as well?
4. **Risk**: Are there sufficient tests to verify behavior is preserved?

### Step 3 — Verify tests pass BEFORE starting

```bash
pnpm test          # Must pass 100%
pnpm typecheck     # Must pass
pnpm lint          # Must pass
```

**If tests fail before you start — STOP.** Do not refactor on top of a broken codebase. Fix the tests first.

### Step 4 — Identify the refactoring type

#### Type A: Extract Method/Function

When a function is too long or does too many things:

```typescript
// Before: createProfile does too much
async createProfile(input: CreateProfileInput): Promise<Result<Profile, ProfileError>> {
  if (!input.name.trim()) return Err(new ProfileValidationError('Name required'));
  if (input.name.length > 64) return Err(new ProfileValidationError('Name too long'));
  const all = await this.repo.findAll();
  const duplicate = all.find(p => p.name === input.name);
  if (duplicate) return Err(new ProfileAlreadyExistsError(input.name));
  const homeDir = this.buildHomeDir(input.name);
  await this.fs.mkdir(homeDir, { recursive: true });
  const profile = this.buildProfile(input, homeDir);
  await this.repo.save(profile);
  return Ok(profile);
}

// After: private methods extracted
async createProfile(input: CreateProfileInput): Promise<Result<Profile, ProfileError>> {
  const validationResult = this.validateInput(input);
  if (!validationResult.ok) return validationResult;

  const duplicateCheck = await this.checkDuplicate(input.name);
  if (!duplicateCheck.ok) return duplicateCheck;

  return this.persistNewProfile(input);
}

private validateInput(input: CreateProfileInput): Result<void, ProfileValidationError> { ... }
private async checkDuplicate(name: string): Promise<Result<void, ProfileAlreadyExistsError>> { ... }
private async persistNewProfile(input: CreateProfileInput): Promise<Result<Profile, ProfileError>> { ... }
```

#### Type B: Extract Interface

When code depends on a concrete implementation instead of an interface:

```typescript
// Before: depends on concrete class
class ProfileService {
  constructor(private readonly repo: ProfileRepository) {} // concrete
}

// After: depends on interface
class ProfileService {
  constructor(private readonly repo: IProfileRepository) {} // interface
}
```

#### Type C: Rename

When naming is unclear:

```typescript
// Before
const d = await repo.getAll();  // what is d? what does getAll return?

// After
const profiles = await repo.findAll();
```

#### Type D: Move to the Correct Layer

When code is in the wrong layer:

```typescript
// Before: business logic in an IPC handler (WRONG)
ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, input) => {
  const all = await repo.findAll();
  if (all.find(p => p.name === input.name)) {
    return Err(new ProfileAlreadyExistsError());
  }
  // ... more business logic here
});

// After: logic moved to service (CORRECT)
ipcMain.handle(IPC_CHANNELS.PROFILES_CREATE, async (_event, rawInput) => {
  const input = CreateProfileInputSchema.safeParse(rawInput);
  if (!input.success) return Err(new ValidationError(input.error.message));
  return profileService.createProfile(input.data); // logic in service
});
```

#### Type E: Eliminate Duplication

When code is copy-pasted:

```typescript
// Before: duplicated validation in multiple handlers
ipcMain.handle(IPC_CHANNELS.PROFILES_UPDATE, async (_event, input) => {
  if (!input.id) return Err(new ValidationError('ID required'));
  // ...
});
ipcMain.handle(IPC_CHANNELS.PROFILES_DELETE, async (_event, input) => {
  if (!input.id) return Err(new ValidationError('ID required')); // duplicate
  // ...
});

// After: shared helper
const ProfileIdParamsSchema = z.object({ id: ProfileIdSchema });

function validateProfileId(input: unknown): Result<ProfileId, ValidationError> {
  const result = ProfileIdParamsSchema.safeParse(input);
  if (!result.success) return Err(new ValidationError(result.error.message));
  return Ok(result.data.id);
}
```

### Step 5 — Refactor in small steps

**Do not refactor everything at once.** For each step:
1. Make one small change
2. Run tests
3. Confirm they pass
4. Commit

```bash
# After each small step:
pnpm test          # Must still pass
pnpm typecheck     # Must still pass
```

### Step 6 — Verify behavior is unchanged

```bash
pnpm test           # All tests pass (same count, no failures)
pnpm test:coverage  # Coverage same or better
pnpm typecheck      # No new errors
pnpm lint           # No new warnings
```

Manual verification: if the refactoring affects UI behavior, test manually.

### Step 7 — Check no architecture rules are violated

After refactoring, verify:
- [ ] Dependency direction has not been reversed
- [ ] Services still do not import Electron
- [ ] Renderer still does not access the filesystem
- [ ] IPC messages still have Zod validation

### Step 8 — Update documentation

**`docs/TECHNICAL_DEBT.md`** — if the refactor resolves a debt item, mark it as resolved.

**`docs/WORKLOG.md`** — add a brief entry about the refactor.

### Step 9 — Commit

```bash
git commit -m "refactor(scope): short description

What changed: [structure change]
Why: [reason — complexity, duplication, architecture violation]
Behavior: unchanged (all tests pass)"
```

---

## What NOT to Refactor Without Approval

Do not refactor the following without explicit approval:

1. **IPC channel names** — breaking change for renderer code
2. **electron-store keys** — breaking change for user data
3. **Public API signatures** — may break callers
4. **Test helpers/utilities** — will break many tests

If any of these need refactoring, create a separate PR with a migration plan.

---

## Refactoring Red Flags

Stop and reconsider if:

- The refactor scope keeps expanding ("just one more thing...")
- Tests start failing for unclear reasons
- The refactor requires changing many tests (tests should not change their behavior expectations)
- A new dependency is needed
- The refactor affects multiple layers simultaneously

---

## Checklist Before Submitting

- [ ] Tests pass: `pnpm test`
- [ ] Typecheck passes: `pnpm typecheck`
- [ ] Lint passes: `pnpm lint`
- [ ] Behavior unchanged (confirmed by tests and manual testing)
- [ ] Architecture rules not violated
- [ ] WORKLOG.md updated
- [ ] TECHNICAL_DEBT.md updated if debt is resolved
- [ ] Commit message is `refactor(scope): ...`
