import { dir, file } from '../engine'
import type { Level } from './types'
import { cwdIs } from './helpers'

export const level02: Level = {
  id: 'l02',
  title: 'Moving around',
  concept:
    "## What is a path?\n\nA **path** is the address of a file or folder, written as a chain of names separated by slashes. For example, `projects/website/index.html` means: inside `projects`, inside `website`, there's a file called `index.html`.\n\n## Relative paths\n\nA **relative path** is written from *where you are right now*. If you're inside `/home/user` and you type `cd projects`, the shell looks for a folder called `projects` inside your current folder — not somewhere else on the system.\n\nThink of it like giving directions from your current spot: \"turn left, then go straight.\" The same direction words mean different things depending on where you're standing.\n\nThe `cd` command (change directory) moves you into a different folder.",
  briefing:
    'Now that you can look around, let\'s move. `cd` (change directory) takes you into a folder.\n\nA *relative* path is relative to where you are now: `cd projects` moves into the `projects` folder inside the current directory. Look before you leap — use `ls` to see what you can enter.\n\nGoal: get inside the `projects/website` folder.',
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        file('todo.txt', 'set up the website'),
        dir('projects', [
          dir('website', [file('index.html', '<h1>Hi</h1>')]),
          dir('scripts', []),
        ]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'cd', 'help', 'clear'],
  objectives: [
    {
      description: 'Move into `/home/user/projects/website`',
      check: (s) => cwdIs(s, '/home/user/projects/website'),
    },
  ],
  hints: [
    'Run `ls` to confirm `projects` is here, then `cd projects`.',
    'From inside `projects`, run `cd website`. You can also do it in one step: `cd projects/website`.',
  ],
  recap:
    'A relative path is interpreted from your current directory. `cd folder` steps in; you can chain steps with slashes like `cd projects/website`.',
}
