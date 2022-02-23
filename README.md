# sugar

Sugar is a Chargebee subscriptions handler for Beemo, the Discord bot (https://beemo.gg/) using a webhook and PostgreSQL

## Getting Started

This project is intended to be used with the latest Active LTS release of [Node.js][nodejs].

### Installing dependencies

To get started, it's as simple as running:

```
yarn
```

## Available Scripts

- `clean` - removes transpiled files,
- `lint` - lint source files and tests,
- `start` - boot up the typescript server,
- `start:dev` - boot up the typescript server in watch mode,
- `dev:base`: helper for using docker-compose with the debug compose file,
- `dev:up`: use the debug docker-compose file and boot it up,
- `dev:down`: bring down the containers created by the debug docker-compose,
- `docker:build`: builds the NodeJS image `sugar` created by the Dockerfile,
- `build` - transpile TypeScript to ES6,
- `newstart` - transpiles and runs the server,
- `test` - run tests
