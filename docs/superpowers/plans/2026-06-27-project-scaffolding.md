# Project Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Claude Launcher Electron project with Vite, React, TypeScript, ESLint, Prettier, and the correct folder structure so that `pnpm dev` launches an Electron window with a React renderer.

**Architecture:** electron-vite is used as the build orchestrator — it handles the dual-target build (main process as CJS/Node, renderer as ESM/Browser) with a single config. Three tsconfig files enforce strict TypeScript per-target. The folder structure mirrors the Clean Architecture layers defined in docs/ARCHITECTURE.md.

**Tech Stack:** Electron 33, React 18, TypeScript 5, Vite 5 via electron-vite, TailwindCSS, ESLint 9, Prettier 3, pnpm 9

---

## File Map

**Created by this plan:**

```
package.json
electron-builder.config.ts      (stub — full config in PR-29)
electron.vite.config.ts
tsconfig.json                   (base — path aliases, shared settings)
tsconfig.node.json              (main + preload: Node target, CJS)
tsconfig.web.json               (renderer: Browser target, ESM)
.eslintrc.cjs
.prettierrc
.gitignore
.editorconfig

src/
  main/
    index.ts                    (app lifecycle, BrowserWindow creation)
    window.ts                   (createWindow factory)
  preload/
    index.ts                    (empty contextBridge stub)
  renderer/
    index.html                  (Vite entry HTML)
    src/
      main.tsx                  (React entry — ReactDOM.createRoot)
      App.tsx                   (root component — "Claude Launcher")
  domain/                       (empty — placeholder dirs)
  shared/
    ipc/
    types/
    utils/
  services/
  repositories/
```

---

## Task 1: Initialize pnpm project and install dependencies

**Files:**
- Create: `package.json`

- [ ] **Step 1: Init the project**

```bash
cd /Users/longnguyen/my/claude_launcher
pnpm init
```

- [ ] **Step 2: Install runtime dependencies**

```bash
pnpm add electron@^33.0.0
```

- [ ] **Step 3: Install build tooling**

```bash
pnpm add -D electron-vite@^2.3.0 vite@^5.4.0 @vitejs/plugin-react@^4.3.0
pnpm add -D typescript@^5.6.0
pnpm add -D react@^18.3.0 react-dom@^18.3.0
pnpm add -D @types/react@^18.3.0 @types/react-dom@^18.3.0 @types/node@^22.0.0
```

- [ ] **Step 4: Install ESLint + Prettier**

```bash
pnpm add -D eslint@^9.0.0 @typescript-eslint/parser@^8.0.0 @typescript-eslint/eslint-plugin@^8.0.0
pnpm add -D eslint-plugin-react@^7.37.0 eslint-plugin-react-hooks@^5.0.0
pnpm add -D prettier@^3.3.0 eslint-config-prettier@^9.1.0
```

- [ ] **Step 5: Install electron-builder**

```bash
pnpm add -D electron-builder@^25.0.0
```

- [ ] **Step 6: Write `package.json` scripts**

Replace the scripts section in `package.json` with:

```json
{
  "name": "claude-launcher",
  "version": "0.0.1",
  "description": "Run multiple isolated Claude Desktop profiles",
  "main": "out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build && electron-builder",
    "preview": "electron-vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.web.json",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {}
}
```

---

## Task 2: TypeScript configuration

**Files:**
- Create: `tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json`

- [ ] **Step 1: Create base `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.web.json" }
  ]
}
```

- [ ] **Step 2: Create `tsconfig.node.json` (main + preload)**

```json
{
  "extends": "@electron-toolkit/tsconfig/tsconfig.node.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "out",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@domain/*": ["./src/domain/*"]
    }
  },
  "include": ["src/main/**/*", "src/preload/**/*", "electron.vite.config.*", "electron-builder.config.*"]
}
```

> Note: If `@electron-toolkit/tsconfig` is unavailable, use the inline version in Step 2b.

- [ ] **Step 2b: If toolkit package unavailable, use standalone `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "out",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@domain/*": ["./src/domain/*"]
    }
  },
  "include": ["src/main/**/*", "src/preload/**/*", "electron.vite.config.*", "electron-builder.config.*"]
}
```

- [ ] **Step 3: Create `tsconfig.web.json` (renderer)**

```json
{
  "compilerOptions": {
    "composite": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "out",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@domain/*": ["./src/domain/*"],
      "@renderer/*": ["./src/renderer/src/*"]
    }
  },
  "include": ["src/renderer/src/**/*", "src/renderer/index.html"]
}
```

- [ ] **Step 4: Verify typecheck runs (will error — no source yet, that's fine)**

```bash
pnpm typecheck 2>&1 | head -5
```

Expected: errors about missing files — this is expected at this stage.

---

## Task 3: electron-vite config

**Files:**
- Create: `electron.vite.config.ts`

- [ ] **Step 1: Create `electron.vite.config.ts`**

```typescript
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@domain': resolve('src/domain'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@domain': resolve('src/domain'),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
        '@domain': resolve('src/domain'),
      },
    },
    plugins: [react()],
  },
})
```

---

## Task 4: ESLint and Prettier

**Files:**
- Create: `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`

- [ ] **Step 1: Create `.eslintrc.cjs`**

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
}
```

- [ ] **Step 2: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

- [ ] **Step 3: Create `.editorconfig`**

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## Task 5: .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
out/
.vite/

# electron-builder
dist-electron/
release/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/settings.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage/

# Environment
.env
.env.local
.env.*.local

# TypeScript
*.tsbuildinfo
```

---

## Task 6: Main process

**Files:**
- Create: `src/main/index.ts`, `src/main/window.ts`

- [ ] **Step 1: Create `src/main/window.ts`**

```typescript
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 900,
    height: 620,
    minWidth: 720,
    minHeight: 480,
    show: false,
    title: 'Claude Launcher',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}
```

- [ ] **Step 2: Install `@electron-toolkit/utils`**

```bash
pnpm add @electron-toolkit/utils
```

- [ ] **Step 3: Create `src/main/index.ts`**

```typescript
import { app, BrowserWindow } from 'electron'
import { createWindow } from './window'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  mainWindow = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

---

## Task 7: Preload script

**Files:**
- Create: `src/preload/index.ts`

- [ ] **Step 1: Create `src/preload/index.ts`** (minimal stub — full implementation in PR-10)

```typescript
import { contextBridge } from 'electron'

// Stub — will be replaced with full typed API in PR-10
contextBridge.exposeInMainWorld('claudeApi', {
  version: '0.0.1',
})
```

---

## Task 8: Renderer (React)

**Files:**
- Create: `src/renderer/index.html`, `src/renderer/src/main.tsx`, `src/renderer/src/App.tsx`

- [ ] **Step 1: Create `src/renderer/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Claude Launcher</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `src/renderer/src/App.tsx`**

```tsx
export default function App(): JSX.Element {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 32 }}>
      <h1>Claude Launcher</h1>
      <p>Project scaffolding complete. Ready to build.</p>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/renderer/src/main.tsx`**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Task 9: Folder structure (empty placeholder directories)

**Files:**
- Create: placeholder files in each layer directory

- [ ] **Step 1: Create domain + shared + services + repositories placeholders**

```bash
mkdir -p src/domain
mkdir -p src/shared/ipc src/shared/types src/shared/utils
mkdir -p src/services/__tests__
mkdir -p src/repositories/__tests__
touch src/domain/.gitkeep
touch src/shared/ipc/.gitkeep
touch src/shared/types/.gitkeep
touch src/shared/utils/.gitkeep
touch src/services/__tests__/.gitkeep
touch src/repositories/__tests__/.gitkeep
```

---

## Task 10: electron-builder stub config

**Files:**
- Create: `electron-builder.config.ts`

- [ ] **Step 1: Create `electron-builder.config.ts`**

```typescript
import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.claudelauncher.app',
  productName: 'Claude Launcher',
  directories: {
    output: 'dist',
    buildResources: 'build',
  },
  files: ['out/**/*'],
  mac: {
    target: [{ target: 'dmg', arch: ['universal'] }],
    category: 'public.app-category.productivity',
  },
  linux: {
    target: ['AppImage', 'deb'],
  },
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
  },
}

export default config
```

---

## Task 11: Smoke test — verify pnpm dev works

- [ ] **Step 1: Run dev**

```bash
pnpm dev
```

Expected: Electron window opens, shows "Claude Launcher" heading with "Project scaffolding complete. Ready to build."

- [ ] **Step 2: Verify typecheck passes**

```bash
pnpm typecheck
```

Expected: zero errors (or only errors about missing `@electron-toolkit/tsconfig` if that package wasn't available — fix by using standalone tsconfig from Task 2 Step 2b).

- [ ] **Step 3: Verify lint passes**

```bash
pnpm lint
```

Expected: zero errors.

- [ ] **Step 4: Close the Electron window**

`Cmd+Q` on macOS or close the window.

---

## Task 12: Initial commit

- [ ] **Step 1: Stage all files**

```bash
git init
git add CLAUDE.md docs/ package.json pnpm-lock.yaml \
  tsconfig.json tsconfig.node.json tsconfig.web.json \
  electron.vite.config.ts electron-builder.config.ts \
  .eslintrc.cjs .prettierrc .editorconfig .gitignore \
  src/
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: initial project scaffolding

- Electron 33 + electron-vite + React 18 + TypeScript 5
- Three tsconfigs: base, node (main/preload), web (renderer)
- ESLint + Prettier configured
- Folder structure per docs/ARCHITECTURE.md
- pnpm dev launches Electron window with React renderer"
```

- [ ] **Step 3: Update WORKLOG.md**

In `docs/WORKLOG.md`, mark PR-01 as complete:

```markdown
### PR-01: Project Scaffolding (2026-06-27)

**Commit**: `chore: initial project scaffolding`
**Files created**: package.json, tsconfig*.json, electron.vite.config.ts,
  .eslintrc.cjs, .prettierrc, .editorconfig, .gitignore,
  src/main/index.ts, src/main/window.ts,
  src/preload/index.ts,
  src/renderer/index.html, src/renderer/src/main.tsx, src/renderer/src/App.tsx,
  electron-builder.config.ts
**Tests**: N/A (PR-02 sets up testing)
**Notes**: Used electron-vite for unified build config. sandbox:true enforced from day one.
```

- [ ] **Step 4: Update TASKS.md**

Check off all PR-01 tasks in `docs/TASKS.md`.
