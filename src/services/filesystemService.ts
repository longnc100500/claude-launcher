import { access, mkdir, rm, readdir } from 'fs/promises'
import type { IFilesystemService, MkdirOptions, RmOptions } from '../domain/filesystem'

export class FilesystemService implements IFilesystemService {
  async exists(path: string): Promise<boolean> {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  }

  async mkdir(path: string, options?: MkdirOptions): Promise<void> {
    await mkdir(path, { recursive: options?.recursive ?? false })
  }

  async rm(path: string, options?: RmOptions): Promise<void> {
    await rm(path, {
      recursive: options?.recursive ?? false,
      force: options?.force ?? false,
    })
  }

  async readdir(path: string): Promise<ReadonlyArray<string>> {
    return readdir(path)
  }
}
