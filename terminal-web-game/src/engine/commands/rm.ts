import { remove } from '../fs'
import { resolvePath } from '../path'
import { ok, err, parseArgs } from './types'
import type { CommandFn } from './types'

export const rm: CommandFn = ({ state, argv }) => {
  const { flags, operands, badFlag } = parseArgs(argv, ['r', 'R', 'f'])
  if (badFlag) return err(`rm: invalid option -- '${badFlag}'`)
  if (operands.length === 0) return err('rm: missing operand')

  const recursive = flags.has('r') || flags.has('R')
  const force = flags.has('f')

  for (const target of operands) {
    const segs = resolvePath(state.fs.cwd, target)
    if ('error' in segs || segs.length === 0) {
      if (force) continue
      return err(`rm: cannot remove '${target}': No such file or directory`)
    }
    const res = remove(state.fs, segs, recursive)
    if (res && 'error' in res) {
      if (res.error === 'EISDIR') {
        return err(`rm: cannot remove '${target}': Is a directory`)
      }
      if (force) continue
      return err(`rm: cannot remove '${target}': No such file or directory`)
    }
  }
  return ok('', true)
}
