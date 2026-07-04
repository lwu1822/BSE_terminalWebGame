import { dir, file } from '../engine'
import type { Level } from './types'
import { cwdIs, ranMatching } from './helpers'

export const level04: Level = {
  id: 'l04',
  title: 'Dot and dot-dot',
  briefing:
    'Two special names live in every directory:\n\n- `.` means "here" (the current directory).\n- `..` means "up one level" (the parent directory).\n\nSo `cd ..` steps back out, and you can chain them: `cd ../..` goes up twice. Combine with folder names too: `cd ../scripts`.\n\nGoal: you\'re in `projects/website`. Hop over to `projects/scripts` using `..` (do not use an absolute path).',
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        dir('projects', [
          dir('website', [file('index.html', 'hi')]),
          dir('scripts', [file('build.sh', 'echo building')]),
        ]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user', 'projects', 'website'],
  allowedCommands: ['pwd', 'ls', 'cd', 'help', 'clear'],
  objectives: [
    {
      description: 'Reach `/home/user/projects/scripts` using `..`',
      check: (s) =>
        cwdIs(s, '/home/user/projects/scripts') &&
        ranMatching(s, (l) => l.startsWith('cd') && l.includes('..')),
    },
  ],
  hints: [
    'From `website`, `..` takes you back to `projects`.',
    'Do it in one hop: `cd ../scripts`.',
  ],
  recap:
    '`.` is the current directory and `..` is the parent. Chain them (`../..`) and combine with names (`../scripts`) to navigate relatively without typing full paths.',
}
