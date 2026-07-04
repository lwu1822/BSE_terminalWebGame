// Core engine types. This module has ZERO React/DOM dependencies.

export interface FileNode {
  type: 'file'
  name: string
  content: string
}

export interface DirNode {
  type: 'dir'
  name: string
  children: Map<string, FSNode>
}

export type FSNode = FileNode | DirNode

export interface FSState {
  /** Root directory, always named '/'. */
  root: DirNode
  /** Current working directory as path segments from root, e.g. ['home', 'user']. */
  cwd: string[]
}

/** Structured, ENOENT-style errors so commands can render authentic messages. */
export type PathErrorCode = 'ENOENT' | 'ENOTDIR' | 'EISDIR' | 'EEXIST'

export interface PathError {
  error: PathErrorCode
  /** The path segment or raw input that triggered the error. */
  path: string
}

export function isPathError(v: unknown): v is PathError {
  return typeof v === 'object' && v !== null && 'error' in v
}

/** A single simulated git commit. */
export interface GitCommit {
  hash: string
  message: string
  /** Snapshot of tracked files at commit time: path -> content. */
  files: Record<string, string>
}

export interface GitState {
  initialized: boolean
  /** Paths currently staged (absolute, slash-joined). */
  staged: string[]
  commits: GitCommit[]
}

export interface AliasState {
  /** alias name -> expansion string. */
  table: Record<string, string>
}

/** Full mutable game state passed to the shell and objective predicates. */
export interface GameState {
  fs: FSState
  git: GitState
  alias: AliasState
  /** Every raw command line the player has entered this level. */
  history: string[]
}

export interface ShellResult {
  /** May contain \n; empty string for silent success. */
  output: string
  isError: boolean
  /** UI uses this to re-render the tree and re-check win conditions. */
  fsChanged: boolean
  /** Special signal for the `clear` command. */
  clear?: boolean
}
