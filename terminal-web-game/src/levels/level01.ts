import { dir, file } from '../engine'
import type { Level } from './types'
import { ranCommand } from './helpers'

export const level01: Level = {
  id: 'l01',
  title: 'Where am I?',
  briefing:
    "Welcome, intern. This machine is a mess, but first things first: figure out where you are.\n\nA shell always has a *current working directory* — the folder your commands act on. Use `pwd` (print working directory) to see it, and `ls` (list) to see what's around you.\n\nType `help` any time to see the commands you can use.",
  initialTree: dir('/', [
    dir('home', [
      dir('user', [
        file('todo.txt', '- learn the terminal\n- clean up this machine'),
        file('welcome.md', '# Welcome\nGlad to have you on the team.'),
        dir('projects', []),
      ]),
    ]),
  ]),
  initialCwd: ['home', 'user'],
  allowedCommands: ['pwd', 'ls', 'help', 'clear'],
  objectives: [
    {
      description: 'Print your current location with `pwd`',
      check: (s) => ranCommand(s, 'pwd'),
    },
    {
      description: 'List the contents of this directory with `ls`',
      check: (s) => ranCommand(s, 'ls'),
    },
  ],
  hints: [
    'Type `pwd` and press Enter. It prints the full path of where you are.',
    'Type `ls` to list the files and folders in the current directory.',
  ],
  recap:
    'Every shell session has a current working directory. `pwd` shows it, and `ls` shows what lives inside it.',
}
