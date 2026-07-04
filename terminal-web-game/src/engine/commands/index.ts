import type { CommandFn } from './types'
import { pwd } from './pwd'
import { ls } from './ls'
import { cd } from './cd'
import { cat } from './cat'
import { touch } from './touch'
import { mkdir } from './mkdir'
import { mv } from './mv'
import { cp } from './cp'
import { rm } from './rm'
import { grep } from './grep'
import { echo } from './echo'
import { aliasCmd } from './aliasCmd'
import { gitCmd } from './gitCmd'

/**
 * Registry of "normal" commands. `clear` and `help` are handled directly in
 * the shell because they need extra context (scrollback, level command list).
 */
export const COMMANDS: Record<string, CommandFn> = {
  pwd,
  ls,
  cd,
  cat,
  touch,
  mkdir,
  mv,
  cp,
  rm,
  grep,
  echo,
  alias: aliasCmd,
  git: gitCmd,
}

export type { CommandFn }
