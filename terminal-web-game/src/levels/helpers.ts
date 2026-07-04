// Objective predicate helpers. Keep level files declarative.
import type { GameState } from '../engine'
import { getNode, resolvePath, segmentsToPath } from '../engine'

/** Resolve an absolute path string to segments (ignores cwd). */
function abs(path: string): string[] {
  const segs = resolvePath([], path)
  return 'error' in segs ? [] : segs
}

/** A file exists at the given absolute path. */
export function fileExists(state: GameState, path: string): boolean {
  const node = getNode(state.fs, abs(path))
  return node?.type === 'file'
}

/** A directory exists at the given absolute path. */
export function dirExists(state: GameState, path: string): boolean {
  const node = getNode(state.fs, abs(path))
  return node?.type === 'dir'
}

/** Any node (file or dir) exists at the given absolute path. */
export function pathExists(state: GameState, path: string): boolean {
  return getNode(state.fs, abs(path)) !== null
}

/** A node does NOT exist at the given absolute path. */
export function pathMissing(state: GameState, path: string): boolean {
  return getNode(state.fs, abs(path)) === null
}

/** File exists and its content contains the given substring. */
export function fileContains(
  state: GameState,
  path: string,
  substr: string,
): boolean {
  const node = getNode(state.fs, abs(path))
  return node?.type === 'file' && node.content.includes(substr)
}

/** Current working directory equals the given absolute path. */
export function cwdIs(state: GameState, path: string): boolean {
  return segmentsToPath(state.fs.cwd) === segmentsToPath(abs(path))
}

/** The player has run a command whose first token matches `cmd`. */
export function ranCommand(state: GameState, cmd: string): boolean {
  return state.history.some((line) => line.trim().split(/\s+/)[0] === cmd)
}

/** The player has run a command line matching a predicate. */
export function ranMatching(
  state: GameState,
  pred: (line: string) => boolean,
): boolean {
  return state.history.some((line) => pred(line.trim()))
}
