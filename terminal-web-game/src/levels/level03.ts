import { dir, file } from '../engine'
import type { Level } from './types'
import { cwdIs, ranCommand } from './helpers'

export const level03: Level = {
  id: 'l03',
  title: 'The map',
  concept:
    "## The filesystem is a tree\n\nImagine an upside-down tree. The **root** is at the top, and every branch splits into more branches. In a computer:\n\n- The top of the tree is called **root**, written as just `/`.\n- Every **directory** is a branch that can hold files (leaves) and subdirectories (smaller branches).\n\n```\n         /\n        / \\\n     home   var\n     /        \\\n   user        log\n   /  \\\nprojects  notes.txt\n```\n\n## Absolute paths\n\nAn **absolute path** starts with `/` (root) and describes the full route from the top of the tree. `/var/log` means: start at root, go into `var`, then into `log`.\n\nAbsolute paths work from *anywhere* — they're like a full street address. No matter where you are, `cd /var/log` takes you to the same place.",
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
