// Shared command types + helpers. Pure TS, no DOM.
import type { GameState, ShellResult } from '../types'

export interface CommandContext {
  state: GameState
  /** Command name as invoked (post alias-expansion). */
  name: string
  /** All tokens after the command name (flags + operands, still mixed). */
  argv: string[]
}

export type CommandFn = (ctx: CommandContext) => ShellResult

export function ok(output = '', fsChanged = false): ShellResult {
  return { output, isError: false, fsChanged }
}

export function err(output: string): ShellResult {
  return { output, isError: true, fsChanged: false }
}

export interface ParsedArgs {
  flags: Set<string>
  operands: string[]
  /** First unknown flag encountered, if any (for realistic error output). */
  badFlag?: string
}

/**
 * Parse short flags (e.g. -a, -l, combined like -la) against a whitelist.
 * Anything after a non-flag token that is not a recognized flag becomes an
 * operand. A leading '-' token with an unrecognized letter sets badFlag.
 */
export function parseArgs(argv: string[], allowed: string[]): ParsedArgs {
  const flags = new Set<string>()
  const operands: string[] = []
  let badFlag: string | undefined

  for (const tok of argv) {
    if (tok.length > 1 && tok.startsWith('-') && !tok.startsWith('--')) {
      for (const ch of tok.slice(1)) {
        if (allowed.includes(ch)) flags.add(ch)
        else if (badFlag === undefined) badFlag = ch
      }
    } else {
      operands.push(tok)
    }
  }

  return { flags, operands, badFlag }
}
