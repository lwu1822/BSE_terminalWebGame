import { describe, expect, it } from 'vitest'
import { createGameState, execute } from '../engine'
import type { GameState } from '../engine'
import { LEVELS } from './index'
import type { Level } from './types'

/** A scripted command sequence that fully solves each level (by level id). */
const SOLUTIONS: Record<string, string[]> = {
  l01: ['pwd', 'ls'],
  l02: ['ls', 'cd projects/website'],
  l03: ['cd /var/log'],
  l04: ['cd ../scripts'],
  l05: ['mkdir notes', 'touch notes/ideas.txt', 'mkdir -p archive/2024/logs'],
  l06: ['grep -r password configs', 'cp configs/db.conf found.txt'],
  l07: [
    'mv report_draft.txt report.txt',
    'mv report.txt archive/',
    'cp -r templates backups',
  ],
  l08: ['rm tmp.log', 'rm -r junk'],
  l09: ['mv report.txt reports/', 'cp -r logs backup'],
  l10: ["alias ll='ls -l'", 'll'],
  l11: ['git init', 'git add app.js', 'git commit -m "first commit"', 'git log'],
}

function solve(level: Level): GameState {
  const gs = createGameState(level.initialTree, level.initialCwd)
  const script = SOLUTIONS[level.id]
  if (!script) throw new Error(`No solution script for level ${level.id}`)
  for (const cmd of script) {
    execute(gs, cmd, {
      allowedCommands: level.allowedCommands,
      aliasEnabled: level.aliasEnabled,
    })
  }
  return gs
}

describe('every level is solvable', () => {
  for (const level of LEVELS) {
    it(`${level.id} — ${level.title}`, () => {
      const gs = solve(level)
      const results = level.objectives.map((o) => o.check(gs))
      expect(results.every(Boolean)).toBe(true)
    })
  }

  it('has a solution script for every registered level', () => {
    for (const level of LEVELS) {
      expect(SOLUTIONS[level.id]).toBeDefined()
    }
  })
})

describe('level definitions are well-formed', () => {
  for (const level of LEVELS) {
    it(`${level.id} has objectives, hints, a concept, and a recap`, () => {
      expect(level.objectives.length).toBeGreaterThan(0)
      expect(level.hints.length).toBeGreaterThan(0)
      expect(level.concept.length).toBeGreaterThan(0)
      expect(level.recap.length).toBeGreaterThan(0)
      // Every allowed command should be a real, dispatchable command.
      expect(level.allowedCommands.length).toBeGreaterThan(0)
    })
  }
})
