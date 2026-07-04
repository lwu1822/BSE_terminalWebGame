import { dir, file } from '../engine'
import type { Level } from './types'
import { dirExists, fileExists, pathMissing } from './helpers'

export const level08: Level = {
  id: 'l08',
  title: 'Danger zone',
  briefing:
    "`rm` deletes files. There is no undo and no trash can — deletion is permanent. To remove a *directory* and everything inside it, you need `rm -r` (recursive).\n\nBe precise: deleting the wrong thing here means losing real work.\n\nGoals:\n1. Delete the stray file `tmp.log`.\n2. Delete the entire `junk` folder.\n3. Leave the `important` folder (and its files) completely untouched.",
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        file('tmp.log', 'temporary noise'),
        dir('junk', [
          file('old1.bak', 'x'),
          file('old2.bak', 'y'),
          dir('cache', [file('blob', 'z')]),
        ]),
        dir('important', [
          file('taxes.pdf', 'do not delete'),
          file('contract.pdf', 'signed'),
        ]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'cd', 'cat', 'rm', 'help', 'clear'],
  objectives: [
    {
      description: 'Delete the file `tmp.log`',
      check: (s) => pathMissing(s, '/home/user/tmp.log'),
    },
    {
      description: 'Delete the whole `junk` directory',
      check: (s) => pathMissing(s, '/home/user/junk'),
    },
    {
      description: 'Keep `important` and its files intact',
      check: (s) =>
        dirExists(s, '/home/user/important') &&
        fileExists(s, '/home/user/important/taxes.pdf') &&
        fileExists(s, '/home/user/important/contract.pdf'),
    },
  ],
  hints: [
    'Remove a single file: `rm tmp.log`.',
    'A folder needs recursion: `rm -r junk`. Double-check the name before you hit Enter!',
  ],
  recap:
    '`rm` deletes permanently — there is no undo. Files go with `rm`, directories need `rm -r`. Always read the target name carefully before confirming.',
}
