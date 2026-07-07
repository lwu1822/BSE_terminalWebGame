import { dir, file } from '../engine'
import type { Level } from './types'
import { ranCommand } from './helpers'

export const level10: Level = {
  id: 'l10',
  title: 'Shortcuts',
  concept:
    "## What is an alias?\n\nAn **alias** is a custom shortcut for a command. Instead of typing a long command every time, you create a short name that expands to the full thing.\n\nFor example, `alias ll='ls -l'` means: whenever I type `ll`, treat it as `ls -l`.\n\n## How aliases work\n\nWhen you type a command, the shell checks if the first word matches any alias *before* running it. If it does, the alias is **expanded** (replaced with its full form), and the expanded command runs.\n\n- `alias` with no arguments lists all your current aliases.\n- `alias name='command'` creates a new one.\n\nAliases are great for commands you type frequently — they save keystrokes and reduce typos.",
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
