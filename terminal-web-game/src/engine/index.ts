// Public engine surface.
import type { DirNode, GameState } from './types'
import { makeFSState } from './fs'
import { initialGitState } from './git'
import { initialAliasState } from './alias'

export * from './types'
export { resolvePath, segmentsToPath, displayPath, HOME_SEGMENTS } from './path'
export {
  file,
  dir,
  cloneNode,
  getNode,
  resolveNode,
  listChildren,
  snapshotFiles,
} from './fs'
export { execute, tokenize } from './shell'
export type { ExecuteOptions } from './shell'
export { computeStatus } from './git'

/** Build a fresh game state for a level from its initial tree + cwd. */
export function createGameState(root: DirNode, cwd: string[]): GameState {
  return {
    fs: makeFSState(root, cwd),
    git: initialGitState(),
    alias: initialAliasState(),
    history: [],
  }
}
