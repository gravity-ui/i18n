# 🌍 Gravity-UI i18n Tools

This repository contains common utilities, libraries, and plugins used for i18n in Gravity-UI.

## Useful Links

- [Demo Project](./example/README.md)

## Install

This is a pnpm + nx monorepo. To work on the packages locally:

```shell
npm run install:global   # installs pnpm globally
pnpm i                   # installs workspace dependencies
```

## Usage

Build and run package commands with `nx`:

```shell
# Build a specific package
pnpm nx build @gravity-ui/i18n-cli

# Typecheck a specific package
pnpm nx typecheck @gravity-ui/i18n-cli

# Lint all packages in parallel
pnpm nx run-many --target=lint --parallel
```

## Libraries

| Name                                                    | Description                                                         | Version                                                |
|-------------------------------------------------------------|------------------------------------------------------------------|----------------------------------------------------------------|
| [i18n](./packages/i18n/README.md)                 | Lightweight i18n library.                  |  <a href="https://npmjs.com/package/@gravity-ui/i18n-core"><img src="https://img.shields.io/npm/v/@gravity-ui/i18n?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [i18n-react](./packages/i18n-react/README.md)               | i18n library for React client applications (ICU Message Syntax).              |  <a href="https://npmjs.com/package/@gravity-ui/i18n-react"><img src="https://img.shields.io/npm/v/@gravity-ui/i18n-react?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [i18n-node](./packages/i18n-node/README.md)                 | i18n library for server applications (ICU Message Syntax).                        |  <a href="https://npmjs.com/package/@gravity-ui/i18n-node"><img src="https://img.shields.io/npm/v/@gravity-ui/i18n-node?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [eslint-plugin-i18n](./packages/eslint-plugin-i18n/README.md) | ESLint rules for i18n.                                       |  <a href="https://npmjs.com/package/@gravity-ui/eslint-plugin-i18n"><img src="https://img.shields.io/npm/v/@gravity-ui/eslint-plugin-i18n?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [i18n-cli](./packages/i18n-cli/README.md)                   | Tool for operations with language files.                   |  <a href="https://npmjs.com/package/@gravity-ui/i18n-cli"><img src="https://img.shields.io/npm/v/@gravity-ui/i18n-cli?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [i18n-babel-plugin](./packages/i18n-babel-plugin/README.md) | Babel plugin for optimizing language files delivery.           |  <a href="https://npmjs.com/package/@gravity-ui/i18n-babel-plugin"><img src="https://img.shields.io/npm/v/@gravity-ui/i18n-babel-plugin?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [i18n-optimize-plugin](./packages/i18n-optimize-plugin/README.md) | Webpack/Rspack plugin for optimizing language files delivery. |  <a href="https://npmjs.com/package/@gravity-ui/i18n-optimize-plugin"><img src="https://img.shields.io/npm/v/@gravity-ui/i18n-optimize-plugin?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a> |
| [vscode-extension](./packages/vscode-extension/README.md) | VS Code extension for creating localization files | |

## Development

1. Install pnpm

    ```bash
    npm run install:global
    ```

1. Install dependencies

    ```bash
    pnpm i
    ```

1. Run commands with `nx`

    ```bash
    # Build the i18n-cli package
    pnpm nx build @gravity-ui/i18n-cli

    # Run typecheck for the i18n-cli package
    pnpm nx typecheck @gravity-ui/i18n-cli

    # Run lint for all packages
    pnpm nx run-many --target=lint --parallel
    ```

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## For AI agents

A monorepo of Gravity UI internationalization packages — the core engine, React and Node bindings, ICU MessageFormat, plus build/lint plugins and a VS Code extension — reach for it as the single source of Gravity UI i18n tooling instead of assembling separate i18n libraries.

### When to use

- You need Gravity UI i18n across both client and server: pick `i18n-react` (React) and/or `i18n-node` (Node), both built on `i18n`/`i18n-core`.
- Shrinking shipped translation bundles: `i18n-babel-plugin` (Babel) or `i18n-optimize-plugin` (Webpack/Rspack) strip metadata and pre-compile markdown.
- Enforcing i18n conventions in code: `eslint-plugin-i18n` rules.

### When not to use

- For a single React app with no server, install [`@gravity-ui/i18n-react`](./packages/i18n-react) directly rather than the whole monorepo.
- For ICU formatting needs outside the Gravity UI ecosystem, FormatJS / `@formatjs/intl` may be a closer fit.

### Common pitfalls

- **Treating the root as a published package** — the root workspace is private; install the specific sub-package (`@gravity-ui/i18n`, `@gravity-ui/i18n-react`, ...) you need.
- **Mixing `i18n` (core, no React) and `i18n-react`** — choose by runtime: core for non-React, `i18n-react` for React clients, `i18n-node` for Node.
- **Skipping the build plugin** — markdown translation keys stay raw unless the babel/optimize plugin transforms them at build time.
- **Using pnpm commands without nx** — package scripts are orchestrated through `nx` (`pnpm nx <target> <pkg>`), not direct per-package `npm run`.

## Documentation for AI agents

Agent-readable documentation for the installed version is located in each package's `node_modules/@gravity-ui/<package>/<build|dist>/docs/INDEX.md` (e.g. `node_modules/@gravity-ui/i18n/build/docs/INDEX.md`).
