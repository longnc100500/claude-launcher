import type { IFilesystemService } from '../domain/filesystem'
import { BinaryNotFoundError } from '../domain/errors'
import type { Result } from '../shared/types/result'
import { Ok, Err } from '../shared/types/result'

// Known default install locations per platform
const KNOWN_PATHS: Readonly<Record<string, ReadonlyArray<string>>> = {
  darwin: [
    '/Applications/Claude.app/Contents/MacOS/Claude',
    `${process.env['HOME'] ?? ''}/Applications/Claude.app/Contents/MacOS/Claude`,
  ],
  linux: [
    '/usr/bin/claude',
    '/usr/local/bin/claude',
    `${process.env['HOME'] ?? ''}/.local/bin/claude`,
    '/opt/claude/claude',
  ],
  win32: [
    'C:\\Users\\Public\\AppData\\Local\\AnthropicClaude\\claude.exe',
    `${process.env['LOCALAPPDATA'] ?? ''}\\AnthropicClaude\\claude.exe`,
    `${process.env['APPDATA'] ?? ''}\\AnthropicClaude\\claude.exe`,
  ],
  aix: [],
  android: [],
  cygwin: [],
  freebsd: [],
  haiku: [],
  netbsd: [],
  openbsd: [],
  sunos: [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

export class BinaryDiscoveryService {
  constructor(private readonly fs: IFilesystemService) {}

  async discover(): Promise<Result<string, BinaryNotFoundError>> {
    const platform = process.platform
    const paths = KNOWN_PATHS[platform] ?? []

    for (const candidate of paths) {
      if (candidate && (await this.fs.exists(candidate))) {
        return Ok(candidate)
      }
    }

    return Err(
      new BinaryNotFoundError(
        `No Claude Desktop binary found. Checked paths for platform: ${platform}`,
      ),
    )
  }

  getKnownPaths(): ReadonlyArray<string> {
    const platform = process.platform
    return KNOWN_PATHS[platform] ?? []
  }
}
