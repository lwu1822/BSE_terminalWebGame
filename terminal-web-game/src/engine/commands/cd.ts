import { getNode } from '../fs'
import { resolvePath, HOME_SEGMENTS } from '../path'
import { ok, err } from './types'
import type { CommandFn } from './types'

export const cd: CommandFn = ({ state, argv }) => {
  const target = argv[0]

  // `cd` alone or `cd ~` => home.
  if (target === undefined || target === '~') {
    state.fs.cwd = [...HOME_SEGMENTS]
    return ok('', true)
  }

  const segs = resolvePath(state.fs.cwd, target)
  if ('error' in segs) {
    return err(`cd: no such file or directory: ${target}`)
  }
  const node = getNode(state.fs, segs)
  if (!node) {
    return err(`cd: no such file or directory: ${target}`)
  }
  if (node.type !== 'dir') {
    return err(`cd: not a directory: ${target}`)
  }
  state.fs.cwd = segs
  return ok('', true)
}
