import { copy } from '../fs'
import { resolvePath } from '../path'
import { ok, err, parseArgs } from './types'
import type { CommandFn } from './types'

export const cp: CommandFn = ({ state, argv }) => {
  const { flags, operands, badFlag } = parseArgs(argv, ['r', 'R'])
  if (badFlag) return err(`cp: invalid option -- '${badFlag}'`)
  if (operands.length < 2) return err('cp: missing destination file operand')
  if (operands.length > 2) return err('cp: too many arguments')

  const [src, dst] = operands
  const recursive = flags.has('r') || flags.has('R')
  const srcSegs = resolvePath(state.fs.cwd, src)
  const dstSegs = resolvePath(state.fs.cwd, dst)
  if ('error' in srcSegs || 'error' in dstSegs) {
    return err(`cp: cannot stat '${src}': No such file or directory`)
  }

  const res = copy(state.fs, srcSegs, dstSegs, recursive)
  if (res && 'error' in res) {
    if (res.error === 'EISDIR') {
      return err(`cp: -r not specified; omitting directory '${src}'`)
    }
    if (res.error === 'ENOENT' && res.path === srcSegs[srcSegs.length - 1]) {
      return err(`cp: cannot stat '${src}': No such file or directory`)
    }
    return err(`cp: cannot create '${dst}': No such file or directory`)
  }
  return ok('', true)
}
