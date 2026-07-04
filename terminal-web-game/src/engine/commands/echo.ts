import { ok } from './types'
import type { CommandFn } from './types'

export const echo: CommandFn = ({ argv }) => {
  // Strip surrounding quotes that survived tokenization (defensive).
  const text = argv
    .map((t) => {
      if (
        (t.startsWith('"') && t.endsWith('"')) ||
        (t.startsWith("'") && t.endsWith("'"))
      ) {
        return t.slice(1, -1)
      }
      return t
    })
    .join(' ')
  return ok(text)
}
