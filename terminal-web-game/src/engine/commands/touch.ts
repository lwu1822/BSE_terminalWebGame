import { createFile } from '../fs'
import { resolvePath } from '../path'
import { ok, err } from './types'
import type { CommandFn } from './types'

export const touch: CommandFn = ({ state, argv }) => {
  if (argv.length === 0) return err('touch: missing file operand')

  for (const target of argv) {
    const segs = resolvePath(state.fs.cwd, target)
    if ('error' in segs) {
      return err(`touch: cannot touch '${target}': No such file or directory`)
    }
    const res = createFile(state.fs, segs)
    if (res && 'error' in res) {
      return err(`touch: cannot touch '${target}': No such file or directory`)
    }
  }
  return ok('', true)
}
