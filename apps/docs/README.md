<p align="center">
    <h1 align="center">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/semaphore-protocol/.github/blob/main/assets/semaphore-logo-light.svg">
        <source media="(prefers-color-scheme: light)" srcset="https://github.com/semaphore-protocol/.github/blob/main/assets/semaphore-logo-dark.svg">
        <img width="250" alt="Semaphore icon" src="https://github.com/semaphore-protocol/.github/blob/main/assets/semaphore-logo-dark.svg">
      </picture>
    </h1>
</p>

<p align="center">
    <a href="https://github.com/semaphore-protocol" target="_blank">
        <img src="https://img.shields.io/badge/project-Semaphore-blue.svg?style=flat-square">
    </a>
    <a href="https://github.com/semaphore-protocol/semaphore/blob/main/LICENSE">
        <img alt="Github license" src="https://img.shields.io/github/license/semaphore-protocol/semaphore.svg?style=flat-square">
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
        <a href="https://semaphore.pse.dev/discord">
            🗣️ Chat &amp; Support
        </a>
    </h4>
</div>

| This repository contains the code for the Semaphore documentation published at [docs.semaphore.pse.dev](https://docs.semaphore.pse.dev). It uses Markdown syntax and the [Docusaurus](https://docusaurus.io/) site generator. |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |

## 📜 Usage

### Start the website

To generate the HTML and start the site, run:

```sh
yarn start
```

Visit the Semaphore docs site in your browser at [http://localhost:3000](http://localhost:3000).

### Build

```
yarn build
```

The `build` command generates static content into the `build` directory that can be served by any static content hosting service.

### Deploy

```
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you use GitHub pages for hosting, this command lets you build the website and push to the `gh-pages` branch.
