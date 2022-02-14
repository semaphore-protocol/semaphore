<p align="center">
    <h1 align="center">
        Semaphore docs
    </h1>
    <p align="center">Semaphore documentation website.</p>
</p>

<p align="center">
    <a href="https://prettier.io/" target="_blank">
        <img alt="Code style prettier" src="https://img.shields.io/badge/code%20style-prettier-f8bc45?style=flat-square&logo=prettier">
    </a>
    <img alt="Repository top language" src="https://img.shields.io/github/languages/top/akinovak/semaphore-spec?style=flat-square">
</p>

Our [documentation website](https://akinovak.github.io/semaphore-spec) was generated with [Docusaurus](https://docusaurus.io/). Please, check https://docusaurus.io/docs for more information.

---

## 🛠 Install

Clone this repository and install the dependencies:

```bash
$ git clone https://github.com/akinovak/semaphore-spec.git semaphore-spec
$ cd semaphore-spec && yarn
```

## 📜 Usage

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

**Notice**: You can find all the markdown documentation files in the `docs` folder.
