import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FilesystemService } from '../filesystemService'
import { mkdtemp, writeFile, mkdir, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('FilesystemService.getDirSize', () => {
  let tmpDir: string
  const fs = new FilesystemService()

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'cdp-test-'))
  })

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('returns 0 for an empty directory', async () => {
    const size = await fs.getDirSize(tmpDir)
    expect(size).toBe(0)
  })

  it('returns total bytes for files in a directory', async () => {
    await writeFile(join(tmpDir, 'a.txt'), 'hello') // 5 bytes
    await writeFile(join(tmpDir, 'b.txt'), 'world!') // 6 bytes
    const size = await fs.getDirSize(tmpDir)
    expect(size).toBe(11)
  })

  it('recurses into subdirectories', async () => {
    await mkdir(join(tmpDir, 'sub'))
    await writeFile(join(tmpDir, 'root.txt'), '123') // 3 bytes
    await writeFile(join(tmpDir, 'sub', 'nested.txt'), '12345') // 5 bytes
    const size = await fs.getDirSize(tmpDir)
    expect(size).toBe(8)
  })

  it('returns 0 for a non-existent path', async () => {
    const size = await fs.getDirSize(join(tmpDir, 'nonexistent'))
    expect(size).toBe(0)
  })
})
