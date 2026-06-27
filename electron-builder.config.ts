import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.claudelauncher.app',
  productName: 'Claude Launcher',
  copyright: 'Copyright © 2026 Claude Launcher Contributors',

  directories: {
    output: 'dist',
    buildResources: 'resources',
  },

  files: [
    'out/**/*',
    '!out/**/*.map',
    'resources/**/*',
    'package.json',
  ],

  // macOS
  mac: {
    category: 'public.app-category.productivity',
    target: [
      { target: 'dmg', arch: ['universal'] },
      { target: 'zip', arch: ['universal'] },
    ],
    icon: 'resources/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist',
  },

  dmg: {
    sign: false,
    window: { width: 540, height: 380 },
    contents: [
      { x: 130, y: 220, type: 'file' },
      { x: 410, y: 220, type: 'link', path: '/Applications' },
    ],
  },

  // Linux
  linux: {
    target: [
      { target: 'AppImage', arch: ['x64'] },
      { target: 'deb', arch: ['x64'] },
    ],
    icon: 'resources/icon.png',
    category: 'Utility',
  },

  // Windows
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'resources/icon.ico',
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },

  // Publish
  publish: {
    provider: 'github',
    owner: 'YOUR_GITHUB_USERNAME',
    repo: 'claude-launcher',
  },
}

export default config
