import { parseAlias } from '../alias'
import { ok, err } from './types'
import type { CommandFn } from './types'

export const aliasCmd: CommandFn = ({ state, argv }) => {
  const intent = parseAlias(argv)

  if (intent.kind === 'list') {
    const entries = Object.entries(state.alias.table)
    if (entries.length === 0) return ok('')
    return ok(entries.map(([k, v]) => `alias ${k}='${v}'`).join('\n'))
  }

  if (intent.kind === 'show') {
    const v = state.alias.table[intent.name]
    if (v === undefined) return err(`alias: ${intent.name}: not found`)
    return ok(`alias ${intent.name}='${v}'`)
  }

  if (!intent.name) return err('alias: invalid alias name')
  state.alias.table[intent.name] = intent.value
  return ok('')
}
