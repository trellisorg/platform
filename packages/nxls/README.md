# Nxls is a CLI for listing information about the projects in your repo

## Install

`yarn global add @trellisorg/nxls` or `npm i @trellisorg/nxls -g`

## Commands

All flags are options

### list projects

Each flag is AND'd together

`nxls list --projectType (-p) app|lib --frameworks (-f) angular|react|node|gatsby|next|web --buildable (-b) true|false`

### find circular dependencies

`nxls circular`

### find unused dependencies

`nxls unused --excludeExternal (-e) true|false`

`-e` will exclude reporting unused `npm` deps.

### TODO

1. Add nice formatting and colors to output
2. Support more utility commands
