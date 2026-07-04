import { segmentsToPath } from '../path'
import { ok } from './types'
import type { CommandFn } from './types'

export const pwd: CommandFn = ({ state }) => {
  return ok(segmentsToPath(state.fs.cwd))
}
