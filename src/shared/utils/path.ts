import { join, isAbsolute } from 'path'

export function joinPaths(...parts: readonly string[]): string {
  return join(...(parts as string[]))
}

export function expandHome(filePath: string): string {
  if (filePath === '~' || filePath.startsWith('~/') || filePath.startsWith('~\\')) {
    const home = process.env['HOME'] ?? process.env['USERPROFILE'] ?? ''
    return home + filePath.slice(1)
  }
  return filePath
}

export function isAbsolutePath(filePath: string): boolean {
  return isAbsolute(filePath)
}
