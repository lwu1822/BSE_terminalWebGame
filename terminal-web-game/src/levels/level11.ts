import { dir, file } from '../engine'
import type { Level } from './types'
import { ranCommand } from './helpers'

export const level11: Level = {
  id: 'l11',
  title: 'Time machine',
  concept:
    "## What is version control?\n\n**Version control** is a system that records changes to your files over time. Think of it as a **time machine** — you can look back at any point in your project's history and see exactly what changed.\n\n## Git basics\n\n**Git** is the most popular version control system. The core workflow is a loop:\n\n1. **`git init`** — start tracking a project (creates a hidden `.git` database).\n2. **`git status`** — see what files have changed since your last snapshot.\n3. **`git add <file>`** — *stage* a change (mark it ready to be saved).\n4. **`git commit -m \"message\"`** — save a **snapshot** (a permanent record of the current state).\n5. **`git log`** — view the history of all your snapshots.\n\n## Why it matters\n\nIf you break something, you can go back to a previous commit. If you're working with others, commits show who changed what and when. It's a safety net for your code.",
  briefing:
    "`git` is version control — a time machine for your files. The basic loop:\n\n- `git init` — start tracking this project.\n- `git status` — see what changed.\n- `git add <file>` — stage a change for the next snapshot.\n- `git commit -m \"message\"` — save a snapshot.\n- `git log` — view past snapshots.\n\nGoals: initialize a repo, stage `app.js`, commit it with a message, then view the log.\n\n(This level is optional — you can skip it.)",
  advanced: true,
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        dir('myproject', [
          file('app.js', "console.log('hello')"),
          file('README.md', '# My Project'),
        ]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user', 'myproject'],
  allowedCommands: ['pwd', 'ls', 'cd', 'cat', 'git', 'help', 'clear'],
  objectives: [
    {
      description: 'Initialize a git repository (`git init`)',
      check: (s) => s.git.initialized,
    },
    {
      description: 'Stage and commit `app.js` with a message',
      check: (s) =>
        s.git.commits.length >= 1 &&
        s.git.commits.some((c) =>
          Object.keys(c.files).some((p) => p.endsWith('app.js')),
        ),
    },
    {
      description: 'View the history with `git log`',
      check: (s) => ranCommand(s, 'git') && s.history.some((l) => /git\s+log/.test(l)),
    },
  ],
  hints: [
    'Start with `git init`, then check state with `git status`.',
    'Stage the file: `git add app.js`, then `git commit -m "first commit"`.',
    'Finally run `git log` to see your commit.',
  ],
  recap:
    'Git saves snapshots of your work. The core loop is add (stage) then commit (snapshot); `status` shows pending changes and `log` shows history.',
}
