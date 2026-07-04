import { describe, expect, it } from 'vitest'
import {
  copy,
  createDir,
  createDirP,
  createFile,
  dir,
  file,
  getNode,
  makeFSState,
  move,
  remove,
} from './fs'
import type { PathError } from './types'

function tree() {
  return dir('/', [
    dir('home', [
      dir('user', [
        file('notes.txt', 'hello'),
        dir('projects', [dir('web', [file('index.html', 'hi')])]),
      ]),
    ]),
  ])
}

function state() {
  return makeFSState(tree(), ['home', 'user'])
}

function isErr(v: void | PathError): v is PathError {
  return !!v && 'error' in v
}

describe('getNode', () => {
  it('finds nested nodes', () => {
    const s = state()
    const n = getNode(s, ['home', 'user', 'notes.txt'])
    expect(n?.type).toBe('file')
  })
  it('returns null for missing paths', () => {
    expect(getNode(state(), ['home', 'nope'])).toBeNull()
  })
})

describe('createFile / createDir', () => {
  it('creates a file in an existing dir', () => {
    const s = state()
    createFile(s, ['home', 'user', 'a.txt'], 'x')
    expect(getNode(s, ['home', 'user', 'a.txt'])).toMatchObject({ content: 'x' })
  })
  it('errors when parent is missing', () => {
    const r = createFile(s(['home', 'user']), ['home', 'ghost', 'a.txt'])
    expect(isErr(r)).toBe(true)
  })
  it('mkdir errors on existing name', () => {
    const s = state()
    const r = createDir(s, ['home', 'user', 'projects'])
    expect(isErr(r) && r.error).toBe('EEXIST')
  })
})

function s(cwd: string[]) {
  return makeFSState(tree(), cwd)
}

describe('createDirP', () => {
  it('creates the whole chain', () => {
    const st = state()
    createDirP(st, ['home', 'user', 'a', 'b', 'c'])
    expect(getNode(st, ['home', 'user', 'a', 'b', 'c'])?.type).toBe('dir')
  })
})

describe('move', () => {
  it('renames a file', () => {
    const st = state()
    move(st, ['home', 'user', 'notes.txt'], ['home', 'user', 'renamed.txt'])
    expect(getNode(st, ['home', 'user', 'notes.txt'])).toBeNull()
    expect(getNode(st, ['home', 'user', 'renamed.txt'])?.type).toBe('file')
  })
  it('moves a file into a directory', () => {
    const st = state()
    move(st, ['home', 'user', 'notes.txt'], ['home', 'user', 'projects'])
    expect(getNode(st, ['home', 'user', 'projects', 'notes.txt'])?.type).toBe(
      'file',
    )
  })
})

describe('copy', () => {
  it('refuses to copy a directory without recursive', () => {
    const st = state()
    const r = copy(st, ['home', 'user', 'projects'], ['home', 'user', 'copy'], false)
    expect(isErr(r) && r.error).toBe('EISDIR')
  })
  it('deep-copies a directory with recursive', () => {
    const st = state()
    copy(st, ['home', 'user', 'projects'], ['home', 'user', 'backup'], true)
    expect(getNode(st, ['home', 'user', 'backup', 'web', 'index.html'])?.type).toBe(
      'file',
    )
    // Ensure it is a deep copy (independent node).
    const orig = getNode(st, ['home', 'user', 'projects', 'web'])
    const copyNode = getNode(st, ['home', 'user', 'backup', 'web'])
    expect(orig).not.toBe(copyNode)
  })
})

describe('remove', () => {
  it('removes a file', () => {
    const st = state()
    remove(st, ['home', 'user', 'notes.txt'], false)
    expect(getNode(st, ['home', 'user', 'notes.txt'])).toBeNull()
  })
  it('refuses to remove a directory without recursive', () => {
    const st = state()
    const r = remove(st, ['home', 'user', 'projects'], false)
    expect(isErr(r) && r.error).toBe('EISDIR')
  })
  it('removes a directory recursively', () => {
    const st = state()
    remove(st, ['home', 'user', 'projects'], true)
    expect(getNode(st, ['home', 'user', 'projects'])).toBeNull()
  })
})
