import { dir, file } from '../engine'
import type { Level } from './types'
import { dirExists, fileExists, pathMissing } from './helpers'

export const level09: Level = {
  id: 'l09',
  title: 'Debug the intern',
  briefing:
    "The last intern tried to tidy this project and left a trail of errors (shown above in the terminal). Read what they *tried* to do and the errors they got, then finish the job correctly.\n\nThey meant to:\n1. Move `report.txt` into the `reports` folder (they misspelled the folder).\n2. Copy the `logs` folder to a new `backup` folder (they forgot it's a directory).\n\nGoal: reach the end state they intended.",
  scriptedIntro: [
    { kind: 'input', text: 'mv report.txt reprots/' },
    {
      kind: 'error',
      text: "mv: cannot move 'report.txt' to 'reprots/report.txt': No such file or directory",
    },
    { kind: 'input', text: 'cp logs backup' },
    { kind: 'error', text: "cp: -r not specified; omitting directory 'logs'" },
    { kind: 'input', text: 'cd reprots' },
    { kind: 'error', text: 'cd: no such file or directory: reprots' },
    { kind: 'system', text: '--- the intern gave up here. your turn. ---' },
  ],
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        file('report.txt', 'Quarterly report — final.'),
        dir('reports', []),
        dir('logs', [
          file('app.log', 'started ok'),
          file('error.log', 'no errors'),
        ]),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'cd', 'cat', 'mv', 'cp', 'grep', 'help', 'clear'],
  objectives: [
    {
      description: 'Move `report.txt` into the (correctly spelled) `reports` folder',
      check: (s) =>
        fileExists(s, '/home/user/reports/report.txt') &&
        pathMissing(s, '/home/user/report.txt'),
    },
    {
      description: 'Copy the `logs` folder to `backup` (recursively)',
      check: (s) =>
        dirExists(s, '/home/user/backup') &&
        fileExists(s, '/home/user/backup/app.log'),
    },
  ],
  hints: [
    'The intern typed `reprots` — the real folder is `reports`. Run `ls` to confirm the spelling.',
    'Fix the move: `mv report.txt reports/`.',
    'Copying a directory needs `-r`: `cp -r logs backup`.',
  ],
  recap:
    'Most terminal errors are precise: a typo\'d path says "No such file or directory", and copying a folder without `-r` is refused. Read the message, fix the exact cause.',
}
