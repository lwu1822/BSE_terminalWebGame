import { dir, file } from '../engine'
import type { Level } from './types'
import { cwdIs, ranCommand } from './helpers'

export const level03: Level = {
  id: 'l03',
  title: 'The map',
  briefing:
    'The filesystem is a tree. At the very top is the *root*, written `/`. Everything branches out from there.\n\nAn *absolute* path starts with `/` and works from any location, no matter where you currently are. `cd /var/log` goes straight to that folder even if you\'re deep inside `/home`.\n\nGoal: jump straight to `/var/log` using an absolute path.',
  initialTree: dir('/', [
    dir('home', [dir('user', [dir('deep', [dir('nested', [dir('spot', [])])])])]),
    dir('var', [
      dir('log', [file('system.log', 'boot ok'), file('errors.log', 'none yet')]),
      dir('www', []),
    ]),
    dir('etc', [file('hosts', '127.0.0.1 localhost')]),
  ]),
  initialCwd: ['home', 'user', 'deep', 'nested', 'spot'],
  allowedCommands: ['pwd', 'ls', 'cd', 'help', 'clear'],
  objectives: [
    {
      description: 'Use an absolute path to reach `/var/log`',
      check: (s) => cwdIs(s, '/var/log') && ranCommand(s, 'cd'),
    },
  ],
  hints: [
    'You start deep inside /home. A relative path would be painful here.',
    'An absolute path starts at root: run `cd /var/log`.',
  ],
  recap:
    'Absolute paths start at the root `/` and work from anywhere. Relative paths depend on your current directory. When far away, absolute paths are simplest.',
}
