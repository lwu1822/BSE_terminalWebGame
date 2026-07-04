import type { DirNode, GameState } from '../engine'

/** A pre-filled scrollback line for scripted intros (e.g. a fake error log). */
export interface TerminalLine {
  text: string
  kind: 'input' | 'output' | 'error' | 'system'
}

export interface Objective {
  /** Shown in the LevelPanel with a live checkbox. */
  description: string
  /** Pure predicate over fs + cwd + history. */
  check: (state: GameState) => boolean
}

export interface Level {
  id: string
  title: string
  /** Shown before start; sets story + concept. */
  briefing: string
  initialTree: DirNode
  initialCwd: string[]
  allowedCommands: string[]
  /** ALL must pass to complete the level. */
  objectives: Objective[]
  /** Progressive hints, revealed one at a time. */
  hints: string[]
  /** Concept recap shown on completion (2-3 sentences). */
  recap: string
  /** Advanced levels are skippable and don't count toward the core run. */
  advanced?: boolean
  /** Alias expansion active for this level. */
  aliasEnabled?: boolean
  /** Pre-filled scrollback, e.g. a fake error log to debug. */
  scriptedIntro?: TerminalLine[]
}
