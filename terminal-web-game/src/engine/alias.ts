// Alias table + expansion — advanced levels only. Pure TS, no DOM.
import type { AliasState } from './types'

export function initialAliasState(): AliasState {
  return { table: {} }
}

/**
 * Parse an `alias` invocation.
 *  - `alias`            -> list all
 *  - `alias name='cmd'` -> define
 *  - `alias name`       -> show one
 * Returns a structured intent for the command module to render.
 */
export type AliasIntent =
  | { kind: 'list' }
  | { kind: 'define'; name: string; value: string }
  | { kind: 'show'; name: string }

export function parseAlias(args: string[]): AliasIntent {
  if (args.length === 0) return { kind: 'list' }
  const joined = args.join(' ')
  const eq = joined.indexOf('=')
  if (eq === -1) return { kind: 'show', name: joined.trim() }
  const name = joined.slice(0, eq).trim()
  let value = joined.slice(eq + 1).trim()
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = value.slice(1, -1)
  }
  return { kind: 'define', name, value }
}

/**
 * Expand a leading alias in a tokenized command line. Only the first token
 * is expanded, once (no recursive expansion) to keep the model simple.
 */
export function expandAlias(alias: AliasState, tokens: string[]): string[] {
  if (tokens.length === 0) return tokens
  const [head, ...rest] = tokens
  const expansion = alias.table[head]
  if (!expansion) return tokens
  return [...expansion.split(/\s+/).filter(Boolean), ...rest]
}
