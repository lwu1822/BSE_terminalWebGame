// Filesystem tree model + operations. Pure TS, no DOM.
import type { DirNode, FileNode, FSNode, FSState, PathError } from './types'
import { resolvePath } from './path'

// ---------------------------------------------------------------------------
// Tree literal helpers (used by level definitions).
// ---------------------------------------------------------------------------

export function file(name: string, content = ''): FileNode {
  return { type: 'file', name, content }
}

export function dir(name: string, children: FSNode[] = []): DirNode {
  const map = new Map<string, FSNode>()
  for (const child of children) map.set(child.name, child)
  return { type: 'dir', name, children: map }
}

/** Deep clone a directory tree (levels reset by re-cloning their initial tree). */
export function cloneNode<T extends FSNode>(node: T): T {
  if (node.type === 'file') {
    return { type: 'file', name: node.name, content: node.content } as T
  }
  const children = new Map<string, FSNode>()
  for (const [k, v] of node.children) children.set(k, cloneNode(v))
  return { type: 'dir', name: node.name, children } as T
}

export function makeFSState(root: DirNode, cwd: string[]): FSState {
  return { root: cloneNode(root), cwd: [...cwd] }
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/** Resolve absolute segments to a node, or null if any segment is missing. */
export function getNode(state: FSState, segments: string[]): FSNode | null {
  let current: FSNode = state.root
  for (const seg of segments) {
    if (current.type !== 'dir') return null
    const next = current.children.get(seg)
    if (!next) return null
    current = next
  }
  return current
}

/** Resolve a raw path string relative to cwd and return the node (or null). */
export function resolveNode(state: FSState, input: string): FSNode | null {
  const segs = resolvePath(state.cwd, input)
  if ('error' in segs) return null
  return getNode(state, segs)
}

/** Return the parent directory node for absolute segments, or null. */
function getParentDir(state: FSState, segments: string[]): DirNode | null {
  if (segments.length === 0) return null // root has no parent
  const parent = getNode(state, segments.slice(0, -1))
  if (!parent || parent.type !== 'dir') return null
  return parent
}

// ---------------------------------------------------------------------------
// Mutations. All take resolved absolute segments and return void | PathError.
// ---------------------------------------------------------------------------

export function createFile(
  state: FSState,
  segments: string[],
  content = '',
): void | PathError {
  const name = segments[segments.length - 1]
  const parent = getParentDir(state, segments)
  if (!parent) return { error: 'ENOENT', path: name ?? '' }
  const existing = parent.children.get(name)
  if (existing) {
    if (existing.type === 'dir') return { error: 'EISDIR', path: name }
    return // touch on existing file: no-op (success)
  }
  parent.children.set(name, file(name, content))
}

export function createDir(
  state: FSState,
  segments: string[],
): void | PathError {
  const name = segments[segments.length - 1]
  const parent = getParentDir(state, segments)
  if (!parent) return { error: 'ENOENT', path: name ?? '' }
  if (parent.children.has(name)) return { error: 'EEXIST', path: name }
  parent.children.set(name, dir(name))
}

/** mkdir -p: create every missing directory along the path. */
export function createDirP(
  state: FSState,
  segments: string[],
): void | PathError {
  let current: DirNode = state.root
  for (const seg of segments) {
    const next = current.children.get(seg)
    if (!next) {
      const created = dir(seg)
      current.children.set(seg, created)
      current = created
    } else if (next.type === 'dir') {
      current = next
    } else {
      return { error: 'ENOTDIR', path: seg }
    }
  }
}

export function remove(
  state: FSState,
  segments: string[],
  recursive: boolean,
): void | PathError {
  const name = segments[segments.length - 1]
  const node = getNode(state, segments)
  if (!node) return { error: 'ENOENT', path: name }
  if (node.type === 'dir' && !recursive) return { error: 'EISDIR', path: name }
  const parent = getParentDir(state, segments)
  if (!parent) return { error: 'ENOENT', path: name }
  parent.children.delete(name)
}

/**
 * Move/rename src -> dst.
 * If dst resolves to an existing directory, src is moved inside it.
 * Otherwise dst's parent must exist and src is renamed to dst's basename.
 */
export function move(
  state: FSState,
  srcSegs: string[],
  dstSegs: string[],
): void | PathError {
  const srcName = srcSegs[srcSegs.length - 1]
  const srcNode = getNode(state, srcSegs)
  if (!srcNode) return { error: 'ENOENT', path: srcName }
  const srcParent = getParentDir(state, srcSegs)
  if (!srcParent) return { error: 'ENOENT', path: srcName }

  const dstNode = getNode(state, dstSegs)
  let targetDir: DirNode
  let targetName: string

  if (dstNode && dstNode.type === 'dir') {
    targetDir = dstNode
    targetName = srcName
  } else {
    const parent = getParentDir(state, dstSegs)
    if (!parent) return { error: 'ENOENT', path: dstSegs[dstSegs.length - 1] }
    targetDir = parent
    targetName = dstSegs[dstSegs.length - 1]
  }

  srcParent.children.delete(srcName)
  const moved = srcNode
  moved.name = targetName
  targetDir.children.set(targetName, moved)
}

/**
 * Copy src -> dst. Directories require recursive=true (teaching moment).
 */
export function copy(
  state: FSState,
  srcSegs: string[],
  dstSegs: string[],
  recursive: boolean,
): void | PathError {
  const srcName = srcSegs[srcSegs.length - 1]
  const srcNode = getNode(state, srcSegs)
  if (!srcNode) return { error: 'ENOENT', path: srcName }
  if (srcNode.type === 'dir' && !recursive) {
    return { error: 'EISDIR', path: srcName }
  }

  const dstNode = getNode(state, dstSegs)
  let targetDir: DirNode
  let targetName: string

  if (dstNode && dstNode.type === 'dir') {
    targetDir = dstNode
    targetName = srcName
  } else {
    const parent = getParentDir(state, dstSegs)
    if (!parent) return { error: 'ENOENT', path: dstSegs[dstSegs.length - 1] }
    targetDir = parent
    targetName = dstSegs[dstSegs.length - 1]
  }

  const cloned = cloneNode(srcNode)
  cloned.name = targetName
  targetDir.children.set(targetName, cloned)
}

/** Sorted child names of a directory node (dirs + files, alphabetical). */
export function listChildren(node: DirNode, includeHidden: boolean): FSNode[] {
  const items = [...node.children.values()]
  const visible = includeHidden
    ? items
    : items.filter((n) => !n.name.startsWith('.'))
  return visible.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Flatten the entire tree into { absolutePath: content } for git snapshots.
 * Paths are slash-joined absolute paths.
 */
export function snapshotFiles(node: DirNode, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const child of node.children.values()) {
    const p = prefix + '/' + child.name
    if (child.type === 'file') {
      out[p] = child.content
    } else {
      Object.assign(out, snapshotFiles(child, p))
    }
  }
  return out
}
