# @gravity-ui/eslint-plugin-i18n

Rules for i18n linting.

## Requirements

- ESLint `^9.0.0 || ^10.0.0` (ESLint 8 is no longer supported since v3)
- Node.js `^20.19.0 || ^22.13.0 || >=24`

## How to connect to a project

1. Install the package:

   ```sh
   npm i --save-dev @gravity-ui/eslint-plugin-i18n
   ```

2. Connect the plugin and rules to the flat ESLint config (`eslint.config.js`):

   ```js
   import i18nPlugin from '@gravity-ui/eslint-plugin-i18n';

   export default [
       {
           plugins: {
               '@gravity-ui/i18n': i18nPlugin,
           },
           rules: {
               '@gravity-ui/i18n/detect-incorrect-calls': 'error',
               '@gravity-ui/i18n/auto-generate-translation-message-id': 'error',
           },
       },
   ];
   ```

## Rules

| Name                                                                                       | Description                                                                                                                            |
| :----------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| [restrict-i18n-imports](docs/rules/restrict-i18n-imports.md)                               | Prohibits importing text files (`i18n.ts`) from directories of other levels.                                                           |
| [detect-incorrect-calls](docs/rules/detect-incorrect-calls.md)                             | Detects i18n calls that don't use a string literal key, and checks that all i18n instances are declared in the current file.           |
| [auto-generate-translation-message-id](docs/rules/auto-generate-translation-message-id.md) | Checks for the presence of an identifier in the translation object and adds it if missing                                              |
| [multiline-meta](docs/rules/multiline-meta.md)                                             | In `i18n.ts`, requires `meta` in message definitions to be multiline objects (with line breaks), not single-line `meta: { ... }`.      |
| [sort-message-locales](docs/rules/sort-message-locales.md)                                 | Enforces locale order in message objects: `ru`, `en`, then other locales (source order), then `meta`.                                  |
| [string-literal-keys](docs/rules/string-literal-keys.md)                                   | Requires i18n message keys to be string literals, not dynamic expressions.                                                             |
