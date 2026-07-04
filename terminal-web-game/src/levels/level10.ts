import { dir, file } from '../engine'
import type { Level } from './types'
import { ranCommand } from './helpers'

export const level10: Level = {
  id: 'l10',
  title: 'Shortcuts',
  briefing:
    "Typing the same long command over and over is tedious. An *alias* is a custom shortcut: `alias name='command'`.\n\nFor example, `alias ll='ls -l'` makes `ll` behave like `ls -l`. Run `alias` with no arguments to list your shortcuts.\n\nGoals:\n1. Create an alias `ll` for `ls -l`.\n2. Use your new `ll` alias.\n\n(This level is optional — you can skip it.)",
  advanced: true,
  aliasEnabled: true,
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        file('a.txt', 'aaa'),
        file('b.txt', 'bbbbb'),
        dir('docs', [file('readme.md', 'hello')]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'cd', 'cat', 'alias', 'help', 'clear'],
  objectives: [
    {
      description: "Define an alias `ll` equal to `ls -l`",
      check: (s) => s.alias.table['ll'] === 'ls -l',
    },
    {
      description: 'Use your `ll` alias',
      check: (s) => ranCommand(s, 'll'),
    },
  ],
  hints: [
    "Define it exactly: `alias ll='ls -l'` (note the single quotes).",
    'Now just type `ll` and press Enter — it expands to `ls -l`.',
  ],
  recap:
    'Aliases turn long commands into short custom names. They are expanded before the command runs, saving keystrokes for things you type often.',
}
