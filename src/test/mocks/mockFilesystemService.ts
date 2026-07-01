import type { IFilesystemService, MkdirOptions, RmOptions } from '../../domain/filesystem'

export class MockFilesystemService implements IFilesystemService {
  private readonly directories = new Set<string>()
  private readonly files = new Map<string, string>()
  private readonly mtimes = new Map<string, Date>()

  async exists(path: string): Promise<boolean> {
    return this.directories.has(path) || this.files.has(path)
  }

  async mkdir(path: string, _options?: MkdirOptions): Promise<void> {
    this.directories.add(path)
  }

  async rm(path: string, options?: RmOptions): Promise<void> {
    if (options?.recursive) {
      // Remove all entries that start with this path
      for (const dir of this.directories) {
        if (dir === path || dir.startsWith(path + '/')) {
          this.directories.delete(dir)
        }
      }
      for (const file of this.files.keys()) {
        if (file === path || file.startsWith(path + '/')) {
          this.files.delete(file)
        }
      }
    } else {
      this.directories.delete(path)
      this.files.delete(path)
    }
  }

  async copyFile(src: string, dest: string): Promise<void> {
    const content = this.files.get(src)
    if (content !== undefined) {
      this.files.set(dest, content)
    }
  }

  async copyDir(src: string, dest: string): Promise<void> {
    // Copy all directories and files under src to dest
    for (const dir of this.directories) {
      if (dir === src || dir.startsWith(src + '/')) {
        this.directories.add(dest + dir.slice(src.length))
      }
    }
    for (const [file, content] of this.files) {
      if (file === src || file.startsWith(src + '/')) {
        this.files.set(dest + file.slice(src.length), content)
      }
    }
  }

  async readdir(path: string): Promise<ReadonlyArray<string>> {
    const prefix = path.endsWith('/') ? path : path + '/'
    const entries = new Set<string>()
    for (const dir of this.directories) {
      if (dir.startsWith(prefix)) {
        const rest = dir.slice(prefix.length)
        if (!rest.includes('/')) {
          entries.add(rest)
        }
      }
    }
    for (const file of this.files.keys()) {
      if (file.startsWith(prefix)) {
        const rest = file.slice(prefix.length)
        if (!rest.includes('/')) {
          entries.add(rest)
        }
      }
    }
    return [...entries]
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path)
    if (content === undefined) throw new Error(`ENOENT: no such file: ${path}`)
    return content
  }

  async statMtime(path: string): Promise<Date> {
    return this.mtimes.get(path) ?? new Date(0)
  }

  // Test helpers
  addDirectory(path: string): void {
    this.directories.add(path)
  }

  addFile(path: string, content = ''): void {
    this.files.set(path, content)
  }

  getDirectories(): ReadonlySet<string> {
    return this.directories
  }

  setMtime(path: string, date: Date): void {
    this.mtimes.set(path, date)
  }

  reset(): void {
    this.directories.clear()
    this.files.clear()
    this.mtimes.clear()
  }
}
