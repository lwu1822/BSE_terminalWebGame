// Path resolution — the pedagogical core. Pure TS, no DOM.
import type { PathError } from './types'

export const HOME_SEGMENTS = ['home', 'user']

/**
 * Resolve a raw user path string against the current working directory.
 *
 * Rules:
 *  - Leading '/' => absolute; otherwise relative to cwd.
 *  - '~' (alone or as leading segment) maps to /home/user.
 *  - '.' is a no-op, '..' pops (stops at root, never errors).
 *  - Empty segments (from '//', trailing '/') are ignored.
 *
 * Returns normalized absolute segments, or a PathError.
 */
export function resolvePath(
  cwd: string[],
  input: string,
): string[] | PathError {
  if (input === '') {
    return { error: 'ENOENT', path: input }
  }

  let rest = input
  let segments: string[]

  if (rest === '~' || rest.startsWith('~/')) {
    // Home expansion.
    segments = [...HOME_SEGMENTS]
    rest = rest.slice(1) // drop '~', leaving '' or '/...'
  } else if (rest.startsWith('/')) {
    segments = []
  } else {
    segments = [...cwd]
  }

  for (const part of rest.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..') {
      if (segments.length > 0) segments.pop()
      continue
    }
    segments.push(part)
  }

  return segments
}

/** Join absolute segments back into a display path string. */
export function segmentsToPath(segments: string[]): string {
  return '/' + segments.join('/')
}

/**
 * Convert absolute segments into the prompt-friendly form, collapsing
 * the home directory to '~'.
 */
export function displayPath(segments: string[]): string {
  if (
    segments.length >= HOME_SEGMENTS.length &&
    HOME_SEGMENTS.every((s, i) => segments[i] === s)
  ) {
    const tail = segments.slice(HOME_SEGMENTS.length)
    return tail.length ? '~/' + tail.join('/') : '~'
  }
  return segmentsToPath(segments)
}

/** The final path segment (basename) of a raw path, resolved against cwd. */
export function basename(cwd: string[], input: string): string {
  const resolved = resolvePath(cwd, input)
  if ('error' in resolved) return input
  return resolved[resolved.length - 1] ?? '/'
}
