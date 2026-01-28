# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gravity-UI i18n Tools is a monorepo containing internationalization libraries and plugins for the Gravity-UI ecosystem. Built on @formatjs/intl, it provides ICU MessageFormat support across different JavaScript environments.

## Development Commands

```bash
# Install pnpm globally (required first)
npm run install:global

# Install dependencies
pnpm i

# Build/test/lint all packages (via Nx)
pnpm run build
pnpm run test
pnpm run lint
pnpm run lint:fix
pnpm run typecheck

# Target specific package
pnpm nx build @gravity-ui/i18n-cli
pnpm nx test @gravity-ui/i18n-react
pnpm nx typecheck @gravity-ui/i18n-core
```

## Architecture

### Package Hierarchy

```
i18n-types          (shared TypeScript types)
    ↓
i18n-core           (framework-agnostic foundation, built on @formatjs/intl)
    ↓
├── i18n-react      (React: hooks, context, Message component)
└── i18n-node       (Server-side implementation)

i18n-cli            (CLI for translation file operations)
eslint-plugin-i18n  (ESLint rules for i18n)
i18n-babel-plugin   (Babel optimization: removes meta, converts markdown)
i18n-optimize-plugin (Webpack/Rspack/Vite via unplugin)
```

### Translation Pattern

Translations are colocated with components in `i18n.ts` files:

```typescript
// src/components/MyComponent/i18n.ts
const {t, Message} = intl.createMessages({
    greeting: {
        en: 'Hello {name}!',
        ru: 'Привет {name}!',
    },
});

// Usage
t('greeting', {count: 1})           // Simple string
<Message id="greeting" values={{name}} />  // Rich text/HTML support
```

### Locale Fallback System

Configurable fallback chains for missing translations:
- Per-locale fallbacks via `fallbackLocales`
- Automatic language detection (e.g., `ru-kz` → `ru`)
- Default fallback options: `'empty-string'`, `'key'`, or specific locale

## Build System

- **Monorepo:** Nx 21.x with pnpm workspaces
- **Build targets depend on `^build`** - dependencies build first
- **Outputs:** ESM (`dist/esm/`) and CJS (`dist/cjs/`)
- **TypeScript:** Strict mode enabled, ES2020 target

## Requirements

- Node.js >= 24.0.0
- pnpm 10.17.1 (enforced via preinstall hook)
