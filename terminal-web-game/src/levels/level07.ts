import { dir, file } from '../engine'
import type { Level } from './types'
import { dirExists, fileExists, pathMissing } from './helpers'

export const level07: Level = {
  id: 'l07',
  title: 'Spring cleaning',
  briefing:
    "This home folder is untidy. Two tools help:\n\n- `mv` moves *or* renames: `mv old.txt new.txt` renames; `mv file.txt dir/` moves it into a folder.\n- `cp` copies. Copying a *directory* needs `-r` (recursive) — try it without and you\'ll get a teaching error.\n\nGoals:\n1. Rename `report_draft.txt` to `report.txt`.\n2. Move `report.txt` into the `archive` folder.\n3. Make a recursive copy of the `templates` folder called `backups`.",
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        file('report_draft.txt', 'Q3 numbers look good.'),
        dir('archive', []),
        dir('templates', [
          file('email.txt', 'Dear {{name}},'),
          file('invoice.txt', 'Amount due: {{total}}'),
        ]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'cd', 'cat', 'mv', 'cp', 'help', 'clear'],
  objectives: [
    {
      description: 'Rename `report_draft.txt` to `report.txt`',
      check: (s) =>
        pathMissing(s, '/home/user/report_draft.txt') &&
        (fileExists(s, '/home/user/report.txt') ||
          fileExists(s, '/home/user/archive/report.txt')),
    },
    {
      description: 'Move `report.txt` into `/home/user/archive`',
      check: (s) => fileExists(s, '/home/user/archive/report.txt'),
    },
    {
      description: 'Recursively copy `templates` to `backups`',
      check: (s) =>
        dirExists(s, '/home/user/backups') &&
        fileExists(s, '/home/user/backups/email.txt'),
    },
  ],
  hints: [
    'Rename: `mv report_draft.txt report.txt`.',
    'Move into a folder: `mv report.txt archive/`.',
    'Copy a directory: `cp -r templates backups` (plain `cp` refuses directories).',
  ],
  recap:
    '`mv` both renames and relocates. `cp` copies files, but copying a directory requires `-r`. That rule prevents accidental partial copies.',
}
