import { move } from '../fs'
import { resolvePath } from '../path'
import { ok, err } from './types'
import type { CommandFn } from './types'

export const mv: CommandFn = ({ state, argv }) => {
  if (argv.length < 2) return err('mv: missing destination file operand')
  if (argv.length > 2) return err('mv: too many arguments')

  const [src, dst] = argv
  const srcSegs = resolvePath(state.fs.cwd, src)
  const dstSegs = resolvePath(state.fs.cwd, dst)
  if ('error' in srcSegs || 'error' in dstSegs) {
    return err(`mv: cannot stat '${src}': No such file or directory`)
  }

  const res = move(state.fs, srcSegs, dstSegs)
  if (res && 'error' in res) {
    if (res.error === 'ENOENT' && res.path === srcSegs[srcSegs.length - 1]) {
      return err(`mv: cannot stat '${src}': No such file or directory`)
    }
    const base = srcSegs[srcSegs.length - 1]
    return err(`mv: cannot move '${src}' to '${dst}/${base}': No such file or directory`)
  }
  return ok('', true)
}
