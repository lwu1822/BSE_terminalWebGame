import type { Level } from '../levels'
import { Markdown } from './Markdown'

interface LevelPanelProps {
  level: Level
  levelIndex: number
  totalLevels: number
  completedCount: number
  objectiveStatus: boolean[]
  allComplete: boolean
  revealedHints: number
  onRevealHint: () => void
  onNext: () => void
  onSkip: () => void
  onReset: () => void
  onOpenLevels: () => void
  hasNext: boolean
}

export function LevelPanel({
  level,
  levelIndex,
  totalLevels,
  completedCount,
  objectiveStatus,
  allComplete,
  revealedHints,
  onRevealHint,
  onNext,
  onSkip,
  onReset,
  onOpenLevels,
  hasNext,
}: LevelPanelProps) {
  const progressPct = Math.round((completedCount / totalLevels) * 100)
  const moreHints = revealedHints < level.hints.length

  return (
    <div className="level-panel">
      <div className="level-header">
        <div className="level-header-text">
          <div className="level-eyebrow">
            Level {levelIndex + 1} / {totalLevels}
            {level.advanced && <span className="badge">optional</span>}
          </div>
          <h1 className="level-title">{level.title}</h1>
        </div>
        <button type="button" className="btn btn-ghost btn-levels" onClick={onOpenLevels}>
          ☰ Levels
        </button>
      </div>

      <div className="progress-bar" aria-label="overall progress">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="objectives">
        <h2 className="panel-title">Objectives</h2>
        <ul className="objective-list">
          {level.objectives.map((obj, i) => (
            <li
              key={i}
              className={`objective ${objectiveStatus[i] ? 'objective-done' : ''}`}
            >
              <span className="checkbox">{objectiveStatus[i] ? '✓' : '○'}</span>
              <span>{obj.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="concept-section">
        <h2 className="panel-title">Concept</h2>
        <Markdown>{level.concept}</Markdown>
      </div>

      <div className="briefing-section">
        <h2 className="panel-title">Briefing</h2>
        <Markdown>{level.briefing}</Markdown>
      </div>

      <div className="hints">
        {level.hints.slice(0, revealedHints).map((hint, i) => (
          <div key={i} className="hint">
            <strong>Hint {i + 1}:</strong> <Markdown>{hint}</Markdown>
          </div>
        ))}
        {moreHints && !allComplete && (
          <button type="button" className="btn btn-ghost" onClick={onRevealHint}>
            {revealedHints === 0 ? 'Need a hint?' : 'Another hint'}
          </button>
        )}
      </div>

      {allComplete && (
        <div className="recap-card">
          <h2>Nice work!</h2>
          <Markdown>{level.recap}</Markdown>
          {hasNext ? (
            <button type="button" className="btn btn-primary" onClick={onNext}>
              Next level →
            </button>
          ) : (
            <p className="finale">You've finished Terminal Trails. 🎉</p>
          )}
        </div>
      )}

      <div className="level-actions">
        {level.advanced && !allComplete && hasNext && (
          <button type="button" className="btn btn-ghost" onClick={onSkip}>
            Skip this optional level
          </button>
        )}
        <button type="button" className="btn btn-ghost btn-reset" onClick={onReset}>
          Reset progress
        </button>
      </div>
    </div>
  )
}
