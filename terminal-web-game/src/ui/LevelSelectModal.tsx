import { LEVELS } from '../levels'

interface LevelSelectModalProps {
  currentIndex: number
  completedLevels: Set<number>
  onSelect: (index: number) => void
  onClose: () => void
}

export function LevelSelectModal({
  currentIndex,
  completedLevels,
  onSelect,
  onClose,
}: LevelSelectModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select a Level</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-grid">
          {LEVELS.map((level, i) => (
            <button
              key={level.id}
              className={`modal-level-card${
                i === currentIndex ? ' current' : ''
              }${completedLevels.has(i) ? ' completed' : ''}${
                level.advanced ? ' advanced' : ''
              }`}
              onClick={() => {
                onSelect(i)
                onClose()
              }}
            >
              <span className="modal-level-num">{i + 1}</span>
              <span className="modal-level-title">{level.title}</span>
              <span className="modal-level-badges">
                {i === currentIndex && <span className="badge-current">Current</span>}
                {completedLevels.has(i) && (
                  <span className="badge-done">✓ Done</span>
                )}
                {level.advanced && <span className="badge-advanced">Optional</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
