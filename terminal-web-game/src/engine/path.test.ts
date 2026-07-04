import { describe, expect, it } from 'vitest'
import { resolvePath, displayPath, segmentsToPath } from './path'
import type { PathError } from './types'

const HOME = ['home', 'user']

function ok(v: string[] | PathError): string[] {
  if ('error' in v) throw new Error('expected path, got error')
  return v
}

describe('resolvePath', () => {
  it('resolves absolute paths from root', () => {
    expect(ok(resolvePath(HOME, '/var/log'))).toEqual(['var', 'log'])
  })

  it('resolves relative paths from cwd', () => {
    expect(ok(resolvePath(HOME, 'projects'))).toEqual(['home', 'user', 'projects'])
  })

  it('treats "." as a no-op', () => {
    expect(ok(resolvePath(HOME, './projects/.'))).toEqual([
      'home',
      'user',
      'projects',
    ])
  })

  it('pops for ".."', () => {
    expect(ok(resolvePath(HOME, '..'))).toEqual(['home'])
    expect(ok(resolvePath(HOME, '../..'))).toEqual([])
  })

  it('never pops above root', () => {
    expect(ok(resolvePath([], '../../..'))).toEqual([])
    expect(ok(resolvePath(HOME, '../../../../etc'))).toEqual(['etc'])
  })

  it('ignores empty segments from // and trailing slash', () => {
    expect(ok(resolvePath(HOME, '/a//b/'))).toEqual(['a', 'b'])
    expect(ok(resolvePath(HOME, 'projects/'))).toEqual([
      'home',
      'user',
      'projects',
    ])
  })

  it('handles mixed ../a/./b', () => {
    expect(ok(resolvePath(HOME, '../a/./b'))).toEqual(['home', 'a', 'b'])
  })

  it('expands ~ to home', () => {
    expect(ok(resolvePath(['var'], '~'))).toEqual(HOME)
    expect(ok(resolvePath(['var'], '~/docs'))).toEqual([...HOME, 'docs'])
  })

  it('errors on empty input', () => {
    const r = resolvePath(HOME, '')
    expect('error' in r).toBe(true)
  })
})

describe('display helpers', () => {
  it('segmentsToPath joins from root', () => {
    expect(segmentsToPath([])).toBe('/')
    expect(segmentsToPath(['var', 'log'])).toBe('/var/log')
  })

  it('displayPath collapses home to ~', () => {
    expect(displayPath(HOME)).toBe('~')
    expect(displayPath([...HOME, 'projects'])).toBe('~/projects')
    expect(displayPath(['var', 'log'])).toBe('/var/log')
    expect(displayPath([])).toBe('/')
  })
})
