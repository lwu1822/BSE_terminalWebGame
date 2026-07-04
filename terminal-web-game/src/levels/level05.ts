import { dir, file } from '../engine'
import type { Level } from './types'
import { dirExists, fileExists } from './helpers'

export const level05: Level = {
  id: 'l05',
  title: 'Making things',
  briefing:
    "Time to build. `mkdir` makes a directory, `touch` creates an empty file.\n\nBy default `mkdir` only makes one level — `mkdir a/b/c` fails if `a` doesn't exist. Add `-p` to create the whole chain: `mkdir -p a/b/c`.\n\nGoals:\n1. Make a directory `notes` here.\n2. Create an empty file `notes/ideas.txt`.\n3. Create the nested path `archive/2024/logs` in one command.",
  initialTree: dir('/', [dir('home', [dir('user', [file('readme.txt', 'start here')])])]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'help', 'clear'],
  objectives: [
    {
      description: 'Create a directory `/home/user/notes`',
      check: (s) => dirExists(s, '/home/user/notes'),
    },
    {
      description: 'Create an empty file `/home/user/notes/ideas.txt`',
      check: (s) => fileExists(s, '/home/user/notes/ideas.txt'),
    },
    {
      description: 'Create the nested directory `/home/user/archive/2024/logs`',
      check: (s) => dirExists(s, '/home/user/archive/2024/logs'),
    },
  ],
  hints: [
    'Use `mkdir notes`, then `touch notes/ideas.txt`.',
    'For the nested one, plain `mkdir` fails. Use `mkdir -p archive/2024/logs`.',
  ],
  recap:
    '`mkdir` creates directories and `touch` creates empty files. `mkdir -p` builds an entire missing path at once.',
}
