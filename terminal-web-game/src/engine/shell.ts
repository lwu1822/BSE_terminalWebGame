// Command parser + dispatcher. Pure TS, no DOM.
import type { GameState, ShellResult } from './types'
import { COMMANDS } from './commands'
import { expandAlias } from './alias'

export interface ExecuteOptions {
  /** Commands the current level permits. Others => command not found. */
  allowedCommands: string[]
  /** Whether alias expansion is active (advanced levels). */
  aliasEnabled?: boolean
}

/**
 * Tokenize a raw command line. Splits on whitespace but keeps text inside
 * matching single or double quotes together. Quotes are stripped from the
 * resulting tokens.
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let hasContent = false

  for (const ch of input) {
    if (quote) {
      if (ch === quote) {
        quote = null
      } else {
        current += ch
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch
      hasContent = true
    } else if (ch === ' ' || ch === '\t') {
      if (current !== '' || hasContent) {
        tokens.push(current)
        current = ''
        hasContent = false
      }
    } else {
      current += ch
      hasContent = true
    }
  }
  if (current !== '' || hasContent) tokens.push(current)
  return tokens
}

function silent(): ShellResult {
  return { output: '', isError: false, fsChanged: false }
}

export function execute(
  state: GameState,
  rawInput: string,
  options: ExecuteOptions,
): ShellResult {
  const trimmed = rawInput.trim()
  state.history.push(rawInput)

  if (trimmed === '') return silent()

  // Reject unsupported shell features with a friendly, on-theme message.
  if (/[|><]/.test(trimmed)) {
    return {
      output:
        "pipes and redirection aren't supported in this game yet — try one command at a time.",
      isError: true,
      fsChanged: false,
    }
  }

  let tokens = tokenize(trimmed)
  if (options.aliasEnabled) {
    tokens = expandAlias(state.alias, tokens)
  }

  const [name, ...argv] = tokens

  // clear: special scrollback signal.
  if (name === 'clear') {
    if (!options.allowedCommands.includes('clear')) {
      return notFound(name)
    }
    return { output: '', isError: false, fsChanged: false, clear: true }
  }

  // help: lists commands available this level.
  if (name === 'help') {
    if (!options.allowedCommands.includes('help')) {
      return notFound(name)
    }
    const list = options.allowedCommands.filter((c) => c !== 'help').sort()
    return {
      output:
        'Available commands:\n  ' +
        list.join('  ') +
        '\n\nTip: run a command with no arguments to see how it behaves.',
      isError: false,
      fsChanged: false,
    }
  }

  // Command exists in the engine?
  const fn = COMMANDS[name]
  if (!fn) {
    return notFound(name)
  }

  // Command exists but not unlocked in this level?
  if (!options.allowedCommands.includes(name)) {
    return {
      output: `command not found: ${name}  (this one unlocks in a later level)`,
      isError: true,
      fsChanged: false,
    }
  }

  return fn({ state, name, argv })
}

function notFound(name: string): ShellResult {
  return {
    output: `command not found: ${name}`,
    isError: true,
    fsChanged: false,
  }
}
