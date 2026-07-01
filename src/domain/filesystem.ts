export interface MkdirOptions {
  readonly recursive?: boolean | undefined
}

export interface RmOptions {
  readonly recursive?: boolean | undefined
  readonly force?: boolean | undefined
}

export interface IFilesystemService {
  exists(path: string): Promise<boolean>
  mkdir(path: string, options?: MkdirOptions): Promise<void>
  rm(path: string, options?: RmOptions): Promise<void>
  readdir(path: string): Promise<ReadonlyArray<string>>
  copyDir(src: string, dest: string): Promise<void>
  copyFile(src: string, dest: string): Promise<void>
  readFile(path: string): Promise<string>
  statMtime(path: string): Promise<Date>
}
