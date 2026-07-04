import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { TerminalLine } from '../levels'

interface TerminalProps {
  lines: TerminalLine[]
  prompt: string
  commandHistory: string[]
  onSubmit: (input: string) => void
}

export function Terminal({ lines, prompt, commandHistory, onSubmit }: TerminalProps) {
  const [input, setInput] = useState('')
  const [histIndex, setHistIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to the bottom whenever new output arrives.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSubmit(input)
      setInput('')
      setHistIndex(null)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const next = histIndex === null ? commandHistory.length - 1 : Math.max(0, histIndex - 1)
      setHistIndex(next)
      setInput(commandHistory[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIndex === null) return
      const next = histIndex + 1
      if (next >= commandHistory.length) {
        setHistIndex(null)
        setInput('')
      } else {
        setHistIndex(next)
        setInput(commandHistory[next])
      }
    }
  }

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-scroll" ref={scrollRef}>
        {lines.map((line, i) => (
          <div key={i} className={`term-line term-${line.kind}`}>
            {line.text === '' ? '\u00A0' : line.text}
          </div>
        ))}
        <div className="term-input-row">
          <span className="term-prompt">{prompt}</span>
          <input
            ref={inputRef}
            className="term-entry"
            value={input}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="terminal input"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  )
}
