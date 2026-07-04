import { useEffect, useMemo, useRef, useState } from 'react'
import { createGameState, displayPath, execute, segmentsToPath } from '../engine'
import type { DirNode, GameState } from '../engine'
import { LEVELS } from '../levels'
import type { Level, TerminalLine } from '../levels'
import {
  defaultProgress,
  loadProgress,
  resetProgress,
  saveProgress,
} from '../state/gameStore'
import { Terminal } from './Terminal'
import { FileTreePanel } from './FileTreePanel'
import { LevelPanel } from './LevelPanel'
import '../App.css'

function initialLines(level: Level): TerminalLine[] {
  return level.scriptedIntro ? [...level.scriptedIntro] : []
}

/** Collect every node's absolute path (dirs + files) for diffing. */
function collectPaths(
  node: DirNode,
  segs: string[] = [],
  acc: Set<string> = new Set(),
): Set<string> {
  acc.add(segmentsToPath(segs))
  for (const child of node.children.values()) {
    const p = [...segs, child.name]
    if (child.type === 'dir') collectPaths(child, p, acc)
    else acc.add(segmentsToPath(p))
  }
  return acc
}

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const levelIndex = Math.min(progress.currentLevel, LEVELS.length - 1)
  const level = LEVELS[levelIndex]

  const gameRef = useRef<GameState>(
    createGameState(level.initialTree, level.initialCwd),
  )
  const [lines, setLines] = useState<TerminalLine[]>(() => initialLines(level))
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [revealedHints, setRevealedHints] = useState(0)
  const [changed, setChanged] = useState<Set<string>>(new Set())
  const [tick, setTick] = useState(0)

  // Persist progress whenever it changes.
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  // Reset per-level runtime state when the active level changes.
  useEffect(() => {
    gameRef.current = createGameState(level.initialTree, level.initialCwd)
    setLines(initialLines(level))
    setCommandHistory([])
    setRevealedHints(0)
    setChanged(new Set())
    setTick((t) => t + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex])

  const gs = gameRef.current
  const prompt = useMemo(
    () => `intern@trails:${displayPath(gs.fs.cwd)}$`,
    // Recompute whenever a command runs (tick) since cwd may change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick, gs.fs.cwd],
  )

  const objectiveStatus = level.objectives.map((o) => o.check(gs))
  const allComplete = objectiveStatus.every(Boolean)

  function runCommand(raw: string) {
    const game = gameRef.current
    const promptStr = `intern@trails:${displayPath(game.fs.cwd)}$`
    const before = collectPaths(game.fs.root)

    const result = execute(game, raw, {
      allowedCommands: level.allowedCommands,
      aliasEnabled: level.aliasEnabled,
    })

    if (result.clear) {
      setLines([])
    } else {
      const newLines: TerminalLine[] = [
        { text: `${promptStr} ${raw}`, kind: 'input' },
      ]
      if (result.output !== '') {
        for (const l of result.output.split('\n')) {
          newLines.push({ text: l, kind: result.isError ? 'error' : 'output' })
        }
      }
      setLines((prev) => [...prev, ...newLines])
    }

    if (raw.trim() !== '') setCommandHistory((prev) => [...prev, raw])

    const after = collectPaths(game.fs.root)
    const changedSet = new Set<string>()
    for (const p of after) if (!before.has(p)) changedSet.add(p)
    setChanged(changedSet)
    setTick((t) => t + 1)

    const done = level.objectives.every((o) => o.check(game))
    if (done) {
      setProgress((p) =>
        p.completed.includes(level.id)
          ? p
          : { ...p, completed: [...p.completed, level.id] },
      )
    }
  }

  function revealHint() {
    setRevealedHints((n) => Math.min(n + 1, level.hints.length))
    setProgress((p) => ({ ...p, hintsUsed: p.hintsUsed + 1 }))
  }

  function goNext() {
    setProgress((p) => ({
      ...p,
      currentLevel: Math.min(p.currentLevel + 1, LEVELS.length - 1),
    }))
  }

  function resetAll() {
    resetProgress()
    setProgress(defaultProgress())
  }

  const hasNext = levelIndex < LEVELS.length - 1

  return (
    <div className="app">
      <aside className="app-left">
        <LevelPanel
          level={level}
          levelIndex={levelIndex}
          totalLevels={LEVELS.length}
          completedCount={progress.completed.length}
          objectiveStatus={objectiveStatus}
          allComplete={allComplete}
          revealedHints={revealedHints}
          onRevealHint={revealHint}
          onNext={goNext}
          onSkip={goNext}
          onReset={resetAll}
          hasNext={hasNext}
        />
      </aside>

      <main className="app-center">
        <Terminal
          lines={lines}
          prompt={prompt}
          commandHistory={commandHistory}
          onSubmit={runCommand}
        />
      </main>

      <aside className="app-right">
        <FileTreePanel
          root={gs.fs.root}
          cwd={gs.fs.cwd}
          changed={changed}
          animationKey={tick}
        />
      </aside>
    </div>
  )
}
