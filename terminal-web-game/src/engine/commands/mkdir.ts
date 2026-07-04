import { createDir, createDirP } from '../fs'
import { resolvePath } from '../path'
import { ok, err, parseArgs } from './types'
import type { CommandFn } from './types'

export const mkdir: CommandFn = ({ state, argv }) => {
  const { flags, operands, badFlag } = parseArgs(argv, ['p'])
  if (badFlag) return err(`mkdir: invalid option -- '${badFlag}'`)
  if (operands.length === 0) return err('mkdir: missing operand')

  const parents = flags.has('p')
  for (const target of operands) {
    const segs = resolvePath(state.fs.cwd, target)
    if ('error' in segs) {
      return err(`mkdir: cannot create directory '${target}': No such file or directory`)
    }
    const res = parents
      ? createDirP(state.fs, segs)
      : createDir(state.fs, segs)
    if (res && 'error' in res) {
      if (res.error === 'EEXIST') {
        return err(`mkdir: cannot create directory '${target}': File exists`)
      }
      return err(`mkdir: cannot create directory '${target}': No such file or directory`)
    }
  }
  return ok('', true)
}
