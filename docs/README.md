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

---

This directory contains the Semaphore documentation published at [semaphore.appliedzkp.org/docs](https://semaphore.appliedzkp.org/docs).

## Build and run Semaphore docs

Semaphore documentation is written in Markdown syntax.
[semaphore.appliedzkp.org/docs](https://semaphore.appliedzkp.org/docs) uses the [Docusaurus](https://docusaurus.io/) site generator and JavaScript tooling to run, build, and deploy the web pages.

- [Install and run for development](#install-and-run-for-development)
- [Use deployment commands](#use-deployment-commands)

## Install and run for development

Install dependencies, build the documentation, and run the site on your local machine.

### Install Node.js and a package manager

If you haven't already, download and install [Node.js](https://nodejs.org/en/).

You can use `npm` (included with Node.js) or `yarn` to install Docusaurus and other Node.js packages.
To install `yarn`, run the following in your terminal:

```sh
$ npm i --global yarn
```

### 🛠 Get the code

Clone the Semaphore repository and then change to the `docs` directory:

```sh
$ git clone https://github.com/appliedzkp/semaphore.git && cd semaphore/docs
```

### Install dependencies

To install dependencies, run `yarn`:

```sh
$ yarn
```

### Start the site

To generate the HTML and start the site, run `yarn start`:

```sh
$ yarn start
```

Visit the Semaphore docs site in your browser at [http://localhost:3000](http://localhost:3000).

## 📜 Use deployment commands

### Develop

```
$ yarn start
```

Th `start` command starts a local development server (default port is `:3000`) and launches the site in your browser.
As you edit, the server reloads most changes and automatically refreshes the site in your browser.

### Build

```
$ yarn build
```

The `build` command generates static content into the `build` directory that can be served by any static content hosting service.

### Deploy

```
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you use GitHub pages for hosting, this command lets you build the website and push to the `gh-pages` branch.
