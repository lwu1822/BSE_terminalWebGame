import { dir, file } from '../engine'
import type { Level } from './types'
import { cwdIs } from './helpers'

export const level02: Level = {
  id: 'l02',
  title: 'Moving around',
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
