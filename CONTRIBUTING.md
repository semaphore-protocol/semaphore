# Contributing

:tada: Thank you for being interested in contributing to the Semaphore project! :tada:

Feel welcome and read the following sections in order to know how to ask questions and how to work on something.

All members of our community are expected to follow our [Code of Conduct](/CODE_OF_CONDUCT.md). Please make sure you are welcoming and friendly in all of our spaces.

We're really glad you're reading this, because we need volunteer developers to help this project come to fruition. 👏

## Issues

The best way to contribute to our projects is by opening a [new issue](https://github.com/semaphore-protocol/semaphore/issues/new/choose) or tackling one of the issues listed [here](https://github.com/semaphore-protocol/semaphore/contribute).

## Pull Requests

Pull requests are great if you want to add a feature or fix a bug. Here's a quick guide:

1. Fork the repo.

2. Run the tests. We only take pull requests with passing tests.

3. Add a test for your change. Only refactoring and documentation changes require no new tests.

4. Make sure to check out the [Style Guide](/CONTRIBUTING.md#style-guide) and ensure that your code complies with the rules.

5. Make the test pass.

6. Commit your changes.

7. Push to your fork and submit a pull request on our `main` branch. Please provide us with some explanation of why you made the changes you made. For new features make sure to explain a standard use case to us.

> [!IMPORTANT]
> We do not accept pull requests for minor grammatical fixes (e.g., correcting typos, rewording sentences) or for fixing broken links, unless they significantly improve clarity or functionality. These contributions, while appreciated, are not a priority for merging. If you notice any of these issues, please create a GitHub Issue to report them so they can be properly tracked and addressed.

## CI (Github Actions) Tests

We use GitHub Actions to test each PR before it is merged.

When you submit your PR (or later change that code), a CI build will automatically be kicked off. A note will be added to the PR, and will indicate the current status of the build.

## Style Guide

### Code rules

We always use ESLint and Prettier. To check that your code follows the rules, simply run the npm script `yarn lint`.

### Commit rules

For commits it is recommended to use [Conventional Commits](https://www.conventionalcommits.org).

Don't worry if it looks complicated, in our repositories, `git commit` opens an interactive app to create your conventional commit.

Each commit message consists of a **header**, a **body** and a **footer**. The **header** has a special format that includes a **type**, a **scope** and a **subject**:

    <type>(<scope>): <subject>
    <BLANK LINE>
    <body>
    <BLANK LINE>
    <footer>

The **header** is mandatory and the **scope** of the header must contain the name of the package you are working on.

#### Type

The type must be one of the following:

-   feat: A new feature
-   fix: A bug fix
-   docs: Documentation only changes
-   style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
-   refactor: A code change that neither fixes a bug nor adds a feature (improvements of the code structure)
-   perf: A code change that improves the performance
-   test: Adding missing or correcting existing tests
-   build: Changes that affect the build system or external dependencies (example scopes: gulp, npm)
-   ci: Changes to CI configuration files and scripts (example scopes: travis, circle)
-   chore: Other changes that don't modify src or test files
-   revert: Reverts a previous commit

#### Scope

The scope should be the name of the npm package affected (as perceived by the person reading the changelog generated from commit messages).

#### Subject

The subject contains a succinct description of the change:

-   Use the imperative, present tense: "change" not "changed" nor "changes"
-   Don't capitalize the first letter
-   No dot (.) at the end

#### Body

Just as in the subject, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Branch rules

-   There must be a `main` branch, used only for the releases.
-   Avoid long descriptive names for long-lived branches.
-   Use kebab-case (no CamelCase).
-   Use grouping tokens (words) at the beginning of your branch names (in a similar way to the `type` of commit).
-   Define and use short lead tokens to differentiate branches in a way that is meaningful to your workflow.
-   Use slashes to separate parts of your branch names.
-   Remove branch after merge if it is not important.

Examples:

```bash
git branch -b docs/readme
git branch -b test/a-feature
git branch -b feat/sidebar
git branch -b fix/b-feature
```
