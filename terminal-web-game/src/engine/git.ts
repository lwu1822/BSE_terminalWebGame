// Simulated git — advanced levels only. Pure TS, no DOM.
import type { GameState, GitCommit, GitState } from './types'
import { snapshotFiles } from './fs'

export function initialGitState(): GitState {
  return { initialized: false, staged: [], commits: [] }
}

/** Deterministic-ish short hash from a string (fake, for display only). */
function shortHash(input: string): string {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16).padStart(7, '0').slice(0, 7)
}

/** Files as they existed in the most recent commit (empty if none). */
export function lastCommitFiles(git: GitState): Record<string, string> {
  const last = git.commits[git.commits.length - 1]
  return last ? last.files : {}
}

export interface GitStatus {
  staged: string[]
  modified: string[] // tracked but changed and not staged
  untracked: string[] // in working tree, never committed, not staged
  deleted: string[] // committed before, now missing
}

/** Diff working tree against last commit, accounting for the staging set. */
export function computeStatus(state: GameState): GitStatus {
  const working = snapshotFiles(state.fs.root)
  const committed = lastCommitFiles(state.git)
  const staged = new Set(state.git.staged)

  const modified: string[] = []
  const untracked: string[] = []
  const deleted: string[] = []

  for (const path of Object.keys(working)) {
    if (staged.has(path)) continue
    if (!(path in committed)) {
      untracked.push(path)
    } else if (committed[path] !== working[path]) {
      modified.push(path)
    }
  }
  for (const path of Object.keys(committed)) {
    if (!(path in working) && !staged.has(path)) deleted.push(path)
  }

  return {
    staged: [...state.git.staged].sort(),
    modified: modified.sort(),
    untracked: untracked.sort(),
    deleted: deleted.sort(),
  }
}

export function makeCommit(state: GameState, message: string): GitCommit {
  const working = snapshotFiles(state.fs.root)
  // New commit tree = previous commit + staged working-tree versions.
  const files = { ...lastCommitFiles(state.git) }
  for (const path of state.git.staged) {
    if (path in working) files[path] = working[path]
    else delete files[path]
  }
  const hash = shortHash(message + state.git.commits.length + Object.keys(files).join(','))
  return { hash, message, files }
}
