import { getNode } from '../fs'
import { resolvePath, segmentsToPath } from '../path'
import { computeStatus, makeCommit } from '../git'
import { ok, err } from './types'
import type { CommandFn } from './types'

export const gitCmd: CommandFn = ({ state, argv }) => {
  const sub = argv[0]
  const git = state.git

  if (!sub) {
    return err('usage: git <init|status|add|commit|log>')
  }

  if (sub === 'init') {
    if (git.initialized) {
      return ok('Reinitialized existing Git repository in /.git/')
    }
    git.initialized = true
    return ok('Initialized empty Git repository in /.git/', true)
  }

  if (!git.initialized) {
    return err('fatal: not a git repository (or any of the parent directories): .git')
  }

  if (sub === 'status') {
    const s = computeStatus(state)
    const lines: string[] = []
    if (s.staged.length) {
      lines.push('Changes to be committed:')
      for (const p of s.staged) lines.push(`\tnew file:   ${p.replace(/^\//, '')}`)
      lines.push('')
    }
    if (s.modified.length) {
      lines.push('Changes not staged for commit:')
      for (const p of s.modified) lines.push(`\tmodified:   ${p.replace(/^\//, '')}`)
      lines.push('')
    }
    if (s.untracked.length) {
      lines.push('Untracked files:')
      for (const p of s.untracked) lines.push(`\t${p.replace(/^\//, '')}`)
      lines.push('')
    }
    if (!s.staged.length && !s.modified.length && !s.untracked.length) {
      lines.push('nothing to commit, working tree clean')
    }
    return ok(lines.join('\n').trimEnd())
  }

  if (sub === 'add') {
    const targets = argv.slice(1)
    if (targets.length === 0) return err('Nothing specified, nothing added.')
    for (const target of targets) {
      const segs = resolvePath(state.fs.cwd, target)
      if ('error' in segs) return err(`fatal: pathspec '${target}' did not match any files`)
      const node = getNode(state.fs, segs)
      if (!node || node.type !== 'file') {
        return err(`fatal: pathspec '${target}' did not match any files`)
      }
      const abs = segmentsToPath(segs)
      if (!git.staged.includes(abs)) git.staged.push(abs)
    }
    return ok('', true)
  }

  if (sub === 'commit') {
    // Expect: commit -m "message"
    const mIdx = argv.indexOf('-m')
    if (mIdx === -1 || !argv[mIdx + 1]) {
      return err('error: commit message required (use -m "message")')
    }
    if (git.staged.length === 0) {
      return err('nothing to commit (use "git add")')
    }
    let message = argv.slice(mIdx + 1).join(' ')
    if (
      (message.startsWith('"') && message.endsWith('"')) ||
      (message.startsWith("'") && message.endsWith("'"))
    ) {
      message = message.slice(1, -1)
    }
    const commit = makeCommit(state, message)
    const count = git.staged.length
    git.commits.push(commit)
    git.staged = []
    return ok(`[main ${commit.hash}] ${message}\n ${count} file(s) changed`, true)
  }

  if (sub === 'log') {
    if (git.commits.length === 0) {
      return err('fatal: your current branch does not have any commits yet')
    }
    const lines = [...git.commits]
      .reverse()
      .map((c) => `commit ${c.hash}\n    ${c.message}`)
    return ok(lines.join('\n\n'))
  }

  return err(`git: '${sub}' is not a git command.`)
}
