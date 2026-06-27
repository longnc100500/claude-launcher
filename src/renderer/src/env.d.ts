/// <reference types="@testing-library/jest-dom" />
import type { ClaudeApi } from '@shared/types/window-api'

declare global {
  interface Window {
    claudeApi: ClaudeApi
  }
}

export {}
