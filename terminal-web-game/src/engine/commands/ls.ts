import { getNode, listChildren } from '../fs'
import { resolvePath } from '../path'
import { ok, err, parseArgs } from './types'
import type { CommandFn } from './types'
import type { FSNode } from '../types'

function formatLong(nodes: FSNode[]): string {
  return nodes
    .map((n) => {
      const perms = n.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'
      const size = n.type === 'file' ? String(n.content.length) : '4096'
      const name = n.type === 'dir' ? n.name + '/' : n.name
      return `${perms} ${size.padStart(5)} ${name}`
    })
    .join('\n')
}

export const ls: CommandFn = ({ state, argv }) => {
  const { flags, operands, badFlag } = parseArgs(argv, ['a', 'l'])
  if (badFlag) return err(`ls: invalid option -- '${badFlag}'`)

  const target = operands[0] ?? '.'
  const segs = resolvePath(state.fs.cwd, target)
  if ('error' in segs) {
    return err(`ls: cannot access '${target}': No such file or directory`)
  }
  const node = getNode(state.fs, segs)
  if (!node) {
    return err(`ls: cannot access '${target}': No such file or directory`)
  }

  if (node.type === 'file') {
    return ok(node.name)
  }

  const children = listChildren(node, flags.has('a'))
  if (flags.has('l')) return ok(formatLong(children))
  return ok(children.map((c) => (c.type === 'dir' ? c.name + '/' : c.name)).join('  '))
}
