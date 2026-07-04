// Progress persistence. The per-level FS state is intentionally NOT persisted —
// reopening a level resets it to its initialTree (deterministic by design).

const STORAGE_KEY = 'terminal-trails:progress:v1'

export interface Progress {
  /** Index of the level currently open. */
  currentLevel: number
  /** Level ids the player has completed. */
  completed: string[]
  /** Total hints revealed across the run (for a light stats display). */
  hintsUsed: number
}

export function defaultProgress(): Progress {
  return { currentLevel: 0, completed: [], hintsUsed: 0 }
}

export function loadProgress(): Progress {
  if (typeof localStorage === 'undefined') return defaultProgress()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      currentLevel: parsed.currentLevel ?? 0,
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      hintsUsed: parsed.hintsUsed ?? 0,
    }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Ignore quota / private-mode errors — progress is a nicety, not critical.
  }
}

export function resetProgress(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}
