import { getNode } from '../fs'
import { resolvePath } from '../path'
import { ok, err } from './types'
import type { CommandFn } from './types'

export const cat: CommandFn = ({ state, argv }) => {
  if (argv.length === 0) return err('cat: missing file operand')

  const chunks: string[] = []
  for (const target of argv) {
    const segs = resolvePath(state.fs.cwd, target)
    const node = 'error' in segs ? null : getNode(state.fs, segs)
    if (!node) {
      return err(`cat: ${target}: No such file or directory`)
    }
    if (node.type === 'dir') {
      return err(`cat: ${target}: Is a directory`)
    }
    chunks.push(node.content)
  }
  return ok(chunks.join('\n'))
}
