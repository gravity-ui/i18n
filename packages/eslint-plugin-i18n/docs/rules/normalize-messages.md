# normalize-messages

In files matched by `filenameMatcher`, enforces that messages inside `createMessages` / `declareMessages` are in the canonical form that `@gravity-ui/i18n-cli` generates for translation files. The rule auto-fixes the messages object.

The rule reuses the `@gravity-ui/i18n-cli` parser and generator, so the expected result is exactly what the generator produces:

- message keys are sorted with `localeCompare(..., 'en', {sensitivity: 'case'})`;
- every message contains exactly the locales from `allowedLocales`, in that order: missing locales are added as `null`, locales outside the list are removed, `undefined` becomes `null`;
- `meta` goes last and contains only `id`, `description` (when not empty), `markdown` and `disableTypograf`, in that order;
- plural forms are ordered `one`, `few`, `many`, `zero`, `two`, `other`; a plural value with all forms empty becomes `''`;
- multiline ICU messages (unless `meta.markdown` is `true`) are printed as template literals prettified by `format-message-print`.

Quote style, key notation (`ru` vs `'ru'`) and other formatting are not checked — leave them to your formatter. Values that already match are kept as written.

Messages that the `i18n-cli` parser cannot handle (spread elements, non-literal values, mixed plural and non-plural translations, etc.) are reported as `cannotNormalize` without a fix. Missing `meta.id` is not reported — use [auto-generate-translation-message-id](auto-generate-translation-message-id.md) for that.

When the messages object contains comments, the problem is reported without an auto-fix (rebuilding the object would lose them).

This rule covers what [sort-message-locales](sort-message-locales.md) does; do not enable both with a different locale order, or their fixes will conflict.

## Setup

```javascript
module.exports = {
    "@gravity-ui/eslint-plugin-i18n/normalize-messages": ["error", {}],
};
```

## Options

- `allowedLocales`: locales in the desired order. Default: `allowedLocales` from the project `i18n.config.ts` / `i18n.config.js` (looked up from ESLint `cwd`, the same as `i18n-cli`), falling back to `['ru', 'en']`.

- `memberExpressions`: array of call patterns like `{ member: 'intl', property: 'createMessages' }`. Default: `[{ member: 'intl', property: 'createMessages' }, { member: 'intl', property: 'declareMessages' }]`.

- `callExpressions`: bare function names treated as message-definition calls. Default: `['createMessages', 'declareMessages']`.

- `filenameMatcher`: default string `'i18n.ts'`, or `{ type: 'regexp', pattern: string, flags?: string }`. Same as in [sort-message-locales](sort-message-locales.md#options).

## Examples

**Incorrect** code for this rule (`allowedLocales: ['ru', 'en']`):

```js
intl.createMessages({
    title: {
        en: "Title",
        kk: "Тақырып",
        meta: {id: "page.title", description: ""},
    },
    action: {
        ru: {other: "действий", one: "действие"},
        en: {one: "", other: ""},
        meta: {id: "page.action"},
    },
});
```

**Correct** code for this rule:

```js
intl.createMessages({
    action: {
        ru: {
            one: "действие",
            other: "действий",
        },
        en: "",
        meta: {id: "page.action"},
    },
    title: {
        ru: null,
        en: "Title",
        meta: {
            id: "page.title",
        },
    },
});
```
