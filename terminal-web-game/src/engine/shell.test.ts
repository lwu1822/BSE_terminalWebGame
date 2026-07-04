import { describe, expect, it } from 'vitest'
import { createGameState, getNode } from './index'
import { execute, tokenize } from './shell'
import { dir, file } from './fs'
import type { GameState } from './types'

const ALL = [
  'pwd',
  'ls',
  'cd',
  'cat',
  'touch',
  'mkdir',
  'mv',
  'cp',
  'rm',
  'grep',
  'echo',
  'alias',
  'git',
  'help',
  'clear',
]

function fresh(): GameState {
  const root = dir('/', [
    dir('home', [
      dir('user', [
        file('notes.txt', 'line one\nSECRET=hunter2\nline three'),
        dir('projects', [dir('web', [file('index.html', 'hi')])]),
        dir('empty', []),
      ]),
    ]),
  ])
  return createGameState(root, ['home', 'user'])
}

function run(gs: GameState, line: string, aliasEnabled = true) {
  return execute(gs, line, { allowedCommands: ALL, aliasEnabled })
}

describe('tokenize', () => {
  it('keeps quoted spans together', () => {
    expect(tokenize('touch "my file.txt"')).toEqual(['touch', 'my file.txt'])
    expect(tokenize("echo 'hello world'")).toEqual(['echo', 'hello world'])
  })
})

describe('pwd / ls / cd', () => {
  it('pwd prints absolute path', () => {
    expect(run(fresh(), 'pwd').output).toBe('/home/user')
  })
  it('ls lists sorted names with trailing slash on dirs', () => {
    const out = run(fresh(), 'ls').output
    expect(out).toContain('projects/')
    expect(out).toContain('notes.txt')
  })
  it('ls -a shows nothing hidden here but does not error', () => {
    expect(run(fresh(), 'ls -a').isError).toBe(false)
  })
  it('ls rejects unknown flags with a realistic message', () => {
    const r = run(fresh(), 'ls -z')
    expect(r.isError).toBe(true)
    expect(r.output).toContain("invalid option -- 'z'")
  })
  it('cd changes directory and updates pwd', () => {
    const gs = fresh()
    run(gs, 'cd projects/web')
    expect(run(gs, 'pwd').output).toBe('/home/user/projects/web')
  })
  it('cd to missing dir gives unix-style error', () => {
    const r = run(fresh(), 'cd nope')
    expect(r.output).toBe('cd: no such file or directory: nope')
  })
  it('cd alone returns home', () => {
    const gs = fresh()
    run(gs, 'cd /')
    run(gs, 'cd')
    expect(run(gs, 'pwd').output).toBe('/home/user')
  })
})

describe('cat / grep', () => {
  it('cat prints file content', () => {
    expect(run(fresh(), 'cat notes.txt').output).toContain('line one')
  })
  it('cat on a directory errors', () => {
    const r = run(fresh(), 'cat projects')
    expect(r.output).toBe('cat: projects: Is a directory')
  })
  it('grep finds a matching line', () => {
    expect(run(fresh(), 'grep SECRET notes.txt').output).toContain('hunter2')
  })
  it('grep -n prefixes line numbers', () => {
    expect(run(fresh(), 'grep -n SECRET notes.txt').output).toBe('2:SECRET=hunter2')
  })
  it('grep -i is case insensitive', () => {
    expect(run(fresh(), 'grep -i secret notes.txt').isError).toBe(false)
  })
})

describe('mkdir / touch', () => {
  it('mkdir -p creates nested dirs', () => {
    const gs = fresh()
    run(gs, 'mkdir -p a/b/c')
    expect(getNode(gs.fs, ['home', 'user', 'a', 'b', 'c'])?.type).toBe('dir')
  })
  it('mkdir without -p on missing parent errors', () => {
    const r = run(fresh(), 'mkdir x/y')
    expect(r.isError).toBe(true)
  })
  it('touch creates a file', () => {
    const gs = fresh()
    run(gs, 'touch new.txt')
    expect(getNode(gs.fs, ['home', 'user', 'new.txt'])?.type).toBe('file')
  })
})

describe('mv / cp / rm', () => {
  it('mv renames', () => {
    const gs = fresh()
    run(gs, 'mv notes.txt renamed.txt')
    expect(getNode(gs.fs, ['home', 'user', 'renamed.txt'])?.type).toBe('file')
  })
  it('cp refuses a directory without -r', () => {
    const r = run(fresh(), 'cp projects copy')
    expect(r.output).toContain("omitting directory 'projects'")
  })
  it('cp -r copies a directory', () => {
    const gs = fresh()
    run(gs, 'cp -r projects backup')
    expect(getNode(gs.fs, ['home', 'user', 'backup', 'web', 'index.html'])?.type).toBe(
      'file',
    )
  })
  it('rm refuses a directory without -r', () => {
    const r = run(fresh(), 'rm projects')
    expect(r.output).toBe("rm: cannot remove 'projects': Is a directory")
  })
  it('rm -r removes a directory', () => {
    const gs = fresh()
    run(gs, 'rm -r projects')
    expect(getNode(gs.fs, ['home', 'user', 'projects'])).toBeNull()
  })
})

describe('shell dispatch rules', () => {
  it('unknown command is not found', () => {
    expect(run(fresh(), 'frobnicate').output).toContain('command not found')
  })
  it('rejects pipes/redirection with a friendly message', () => {
    const r = run(fresh(), 'cat notes.txt | grep x')
    expect(r.isError).toBe(true)
    expect(r.output).toContain("aren't supported")
  })
  it('disallowed-but-real command hints it unlocks later', () => {
    const gs = fresh()
    const r = execute(gs, 'git status', { allowedCommands: ['ls'] })
    expect(r.output).toContain('later level')
  })
  it('clear signals scrollback reset', () => {
    expect(run(fresh(), 'clear').clear).toBe(true)
  })
  it('alias defines and expands', () => {
    const gs = fresh()
    run(gs, "alias ll='ls -l'")
    expect(gs.alias.table['ll']).toBe('ls -l')
    expect(run(gs, 'll').isError).toBe(false)
  })
})

describe('simulated git', () => {
  it('runs the full init/add/commit/log loop', () => {
    const gs = fresh()
    expect(run(gs, 'git init').fsChanged).toBe(true)
    run(gs, 'git add notes.txt')
    const commit = run(gs, 'git commit -m "first"')
    expect(commit.isError).toBe(false)
    expect(gs.git.commits.length).toBe(1)
    expect(run(gs, 'git log').output).toContain('first')
  })
  it('errors when not initialized', () => {
    expect(run(fresh(), 'git status').output).toContain('not a git repository')
  })
})
