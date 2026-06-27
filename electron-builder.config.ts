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
