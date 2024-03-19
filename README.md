# Orkestra Document Management Service

## Introduction

Express based micro-service for managing user documents via Azure BLOB Storage and authentication via ADB2C.
See [architecture here.](https://orkestra-scs.atlassian.net/wiki/spaces/PD/pages/436207639/Orkestra+2.0+Document+Management)

## Getting Started

Pre-requisites:

- node (v18+)
- npm (v8+)
- docker compose (v2+)

Create `.env` file by making a copy of `.env.template` and filling in missing values

Running development server:

1. `npm install`
2. `npm run dev`

Running development database:

1. `npm run database:start`
2. `npm run database:migrate`

Creating new migrations can be done automatically by updating the `schema.prisma` models and running `npm run database:migrate`. For more details see the [prisma docs](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate).

For VSCode it's recommended to install the [Prisma Plugin](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)

## Tests

Tests can be run with

`npm run test`

To automatically re-run tests when files change run

`npm run test -- --watch`

To watch specific files matching a regex, for example filenames containing "route", run

`npm run test -- --watch route`

## Linting

This project uses [eslint](https://eslint.org/) for static analysis. If using VSCode its recommended to install [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Style Guidelines

This project uses [Prettier](https://prettier.io/) to enforce code formatting.
To setup prettier for your editor see https://prettier.io/docs/en/editors.html

For VSCode it's recommended to install the [Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and enable it on save.

## Commit Guidelines

For branch naming conventions and developer workflow guidelines see [Development Workflow](https://orkestra-scs.atlassian.net/wiki/spaces/PD/pages/35291365/Development+Workflow)

Pre-commit hooks run prettier on all files to enforce style guidelines.

To skip this run with `git push --no-verify`
