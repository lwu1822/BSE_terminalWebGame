import { getNode, listChildren } from '../fs'
import { resolvePath, segmentsToPath } from '../path'
import { ok, err, parseArgs } from './types'
import type { CommandFn } from './types'
import type { DirNode } from '../types'

interface Match {
  file: string
  lineNo: number
  line: string
}

function searchContent(
  label: string,
  content: string,
  pattern: string,
  ci: boolean,
): Match[] {
  const matches: Match[] = []
  const lines = content.split('\n')
  const needle = ci ? pattern.toLowerCase() : pattern
  lines.forEach((line, i) => {
    const hay = ci ? line.toLowerCase() : line
    if (hay.includes(needle)) {
      matches.push({ file: label, lineNo: i + 1, line })
    }
  })
  return matches
}

export const grep: CommandFn = ({ state, argv }) => {
  const { flags, operands, badFlag } = parseArgs(argv, ['i', 'n', 'r', 'R'])
  if (badFlag) return err(`grep: invalid option -- '${badFlag}'`)
  if (operands.length < 2) {
    return err('usage: grep [-inr] PATTERN FILE')
  }

  const [pattern, ...targets] = operands
  const ci = flags.has('i')
  const recursive = flags.has('r') || flags.has('R')
  const multi = recursive || targets.length > 1

  const all: Match[] = []

  for (const target of targets) {
    const segs = resolvePath(state.fs.cwd, target)
    if ('error' in segs) {
      return err(`grep: ${target}: No such file or directory`)
    }
    const node = getNode(state.fs, segs)
    if (!node) {
      return err(`grep: ${target}: No such file or directory`)
    }
    if (node.type === 'dir') {
      if (!recursive) {
        return err(`grep: ${target}: Is a directory`)
      }
      const walk = (d: DirNode, prefix: string[]) => {
        for (const child of listChildren(d, false)) {
          const p = [...prefix, child.name]
          if (child.type === 'file') {
            all.push(...searchContent(segmentsToPath(p), child.content, pattern, ci))
          } else {
            walk(child, p)
          }
        }
      }
      walk(node, segs)
    } else {
      all.push(...searchContent(target, node.content, pattern, ci))
    }
  }

  if (all.length === 0) return { output: '', isError: true, fsChanged: false }

  const lines = all.map((m) => {
    const parts: string[] = []
    if (multi) parts.push(m.file)
    if (flags.has('n')) parts.push(String(m.lineNo))
    parts.push(m.line)
    return parts.join(':')
  })
  return ok(lines.join('\n'))
}
