<p align="center">
    <h1 align="center">
        Semaphore CLI
    </h1>
    <p align="center">A command line tool to set up your Semaphore project and get group data.</p>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
    </a>
    <a href="https://www.npmjs.com/package/@semaphore-protocol/cli">
        <img alt="NPM version" src="https://img.shields.io/npm/v/@semaphore-protocol/cli?style=flat-square" />
    </a>
    <a href="https://npmjs.org/package/@semaphore-protocol/cli">
        <img alt="Downloads" src="https://img.shields.io/npm/dm/@semaphore-protocol/cli.svg?style=flat-square" />
    </a>
    <a href="https://eslint.org/">
        <img alt="Linter eslint" src="https://img.shields.io/badge/linter-eslint-8080f2?style=flat-square&logo=eslint" />
    </a>
    <a href="https://prettier.io/">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier" />
    </a>
</p>

<div align="center">
    <h4>
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CONTRIBUTING.md">
            👥 Contributing
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/blob/main/CODE_OF_CONDUCT.md">
            🤝 Code of conduct
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://github.com/semaphore-protocol/semaphore/contribute">
            🔎 Issues
        </a>
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a href="https://semaphore.appliedzkp.org/discord">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| Setting up a project, although not particularly complex, can be a lengthy process for some people. The Semaphore CLI reduces the set-up time from a few minutes to a few seconds. In addition, it can also be used to obtain on-chain group data. |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 🛠 Install

Install the `@semaphore-protocol/cli` package globally:

```bash
npm i -g @semaphore-protocol/cli
```

or run specific commands with `npx`:

```bash
npx @semaphore-protocol/cli create my-app
```

## 📜 Usage

```
Usage: semaphore [options] [command]

A command line tool to set up your Semaphore project and get group data.

Options:
-v, --version Show Semaphore CLI version.
-h, --help Display this help.

Commands:
  create [options] [project-directory]  Create a Semaphore project with a supported template.
  get-groups [options]                  Get the list of groups from a supported network (e.g. goerli or arbitrum).
  get-group [options] [group-id]        Get the data of a group from a supported network (e.g. goerli or arbitrum).
  get-members [options] [group-id]      Get the members of a group from a supported network (e.g. goerli or arbitrum).
  get-proofs [options] [group-id]       Get the proofs of a group from a supported network (e.g. goerli or arbitrum).
  help [command]                        Display help for a specific command.
```
