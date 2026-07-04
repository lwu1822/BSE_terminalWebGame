import { listChildren, segmentsToPath } from '../engine'
import type { DirNode, FSNode } from '../engine'

interface FileTreePanelProps {
  root: DirNode
  cwd: string[]
  /** Absolute path strings changed by the last command (brief highlight). */
  changed: Set<string>
  /** Bumps every command so CSS flash animations retrigger. */
  animationKey: number
}

interface NodeProps {
  node: FSNode
  segments: string[]
  cwdPath: string
  changed: Set<string>
}

function TreeNode({ node, segments, cwdPath, changed }: NodeProps) {
  const path = segmentsToPath(segments)
  const isCwd = path === cwdPath
  const isChanged = changed.has(path)
  const classes = ['tree-node', `tree-${node.type}`]
  if (isCwd) classes.push('tree-cwd')
  if (isChanged) classes.push('tree-flash')

  if (node.type === 'file') {
    return (
      <li className={classes.join(' ')}>
        <span className="tree-icon">•</span>
        <span className="tree-name">{node.name}</span>
      </li>
    )
  }

  const children = listChildren(node, true)
  return (
    <li className={classes.join(' ')}>
      <span className="tree-icon">{isCwd ? '▸' : '▾'}</span>
      <span className="tree-name">{node.name === '/' ? '/' : node.name + '/'}</span>
      {children.length > 0 && (
        <ul className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.name}
              node={child}
              segments={[...segments, child.name]}
              cwdPath={cwdPath}
              changed={changed}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function FileTreePanel({ root, cwd, changed, animationKey }: FileTreePanelProps) {
  const cwdPath = segmentsToPath(cwd)
  return (
    <div className="tree-panel">
      <h2 className="panel-title">Filesystem</h2>
      <ul className="tree-root" key={animationKey}>
        <TreeNode node={root} segments={[]} cwdPath={cwdPath} changed={changed} />
      </ul>
    </div>
  )
}
