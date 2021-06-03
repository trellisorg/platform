# Nxls is a CLI for listing information about the projects in your repo

## Install

`yarn global add @trellisorg/nxls` or `npm i @trellisorg/nxls -g`

## Commands

All flags are options

### list projects

Each flag is AND'd together

`nxls list --projectType (-p) app|lib --frameworks (-f) angular|react|node|gatsby|next|web --buildable (-b) true|false`

#### Examples:

1. List all projects

`nxls list`

2. List all apps

`nxls list -p app`

3. List all Angular apps

`nxls list -p app -f angular`

4. List all Angular and React Apps

`nxls list -p app -f angular react`

5. List all buildable projects

`nxls list -b true`

6. List all buildable react libs

`nxls list -b false -f react -p lib`

### find circular dependencies

`nxls circular`

### find unused dependencies

`nxls unused --excludeExternal (-e) true|false`

`-e` will exclude reporting unused `npm` deps.

### find dependency chains between source projects and a target

`nxls chain --source (-s) ...<project name> --target (-t) <project name>`

#### Examples

1. Find all chains between app1 and lib2 as well as app2 and lib2

`nxls chain -s app1 app2 -t lib2`

### TODO

1. Add nice formatting and colors to output
2. Support more utility commands
