import { access, mkdir, rm, readdir, stat, cp, readFile } from 'fs/promises'
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

  async copyDir(src: string, dest: string): Promise<void> {
    await cp(src, dest, { recursive: true, force: true })
  }

  async copyFile(src: string, dest: string): Promise<void> {
    await cp(src, dest)
  }

  async readFile(path: string): Promise<string> {
    return readFile(path, 'utf-8')
  }

  async statMtime(path: string): Promise<Date> {
    const s = await stat(path)
    return s.mtime
  }
}
