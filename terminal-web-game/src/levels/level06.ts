import { dir, file } from '../engine'
import type { Level } from './types'
import { fileContains, fileExists, ranCommand } from './helpers'

export const level06: Level = {
  id: 'l06',
  title: 'Reading & searching',
  briefing:
    'A teammate left a database password in one of the config files, but nobody remembers which. `cat` prints a file\'s contents. `grep` searches for text: `grep PATTERN file`.\n\nUseful flags: `-i` (case-insensitive), `-n` (show line numbers), and `-r` (search a whole directory recursively).\n\nGoal: find which config holds the password, then copy that file to `/home/user/found.txt` so the team can see it.',
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        dir('configs', [
          file('app.conf', 'name=myapp\nport=8080\ndebug=false'),
          file('cache.conf', 'ttl=3600\nsize=256mb'),
          file(
            'db.conf',
            'host=localhost\nport=5432\nuser=admin\npassword=hunter2\nssl=true',
          ),
        ]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'cd', 'cat', 'grep', 'cp', 'help', 'clear'],
  objectives: [
    {
      description: 'Search for the password with `grep`',
      check: (s) => ranCommand(s, 'grep'),
    },
    {
      description: 'Copy the file containing the password to `/home/user/found.txt`',
      check: (s) =>
        fileExists(s, '/home/user/found.txt') &&
        fileContains(s, '/home/user/found.txt', 'password=hunter2'),
    },
  ],
  hints: [
    'Search everything at once: `grep -r password configs`.',
    'The match is in `configs/db.conf`. Copy it: `cp configs/db.conf found.txt`.',
  ],
  recap:
    '`cat` reads files; `grep` searches inside them. `grep -r pattern dir` scans a whole tree — perfect for hunting a value across many files.',
}
