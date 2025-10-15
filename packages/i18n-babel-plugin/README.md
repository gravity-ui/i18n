# @gravity-ui/i18n-babel-plugin

Babel plugin for optimizing translation file delivery.

If you're not using babel, then [i18n-optimize-plugin](../i18n-optimize-plugin/README.md) would be suitable for you.

*Transforms `i18n.ts` files:*

- Removes meta from messages (id, description, etc.)
- Converts markdown to html (when `meta.markdown === true`)
- Applies typography rules to key content

*TODO:*

- Validates syntax according to ICU MessageFormat
- Compiles ICU MessageFormat to AST
- Replaces original keys with hashes (allows reducing key length)

## Usage

Install the plugin:

```bash
npm install @gravity-ui/i18n-babel-plugin --save-dev
```

Connect the plugin to the build. Example if you're using `app-builder`:

```ts
import {defineConfig} from '@gravity-ui/app-builder';

export default defineConfig({
    client: {
        babel: (config) => {
            const plugins = config.plugins ? [...config.plugins] : [];

            return {
                ...config,
                plugins: [
                    ...plugins,
                    require.resolve('@gravity-ui/i18n-babel-plugin')
                ],
            };
        }
    }
});
```

## Settings

### typograf

Allows configuring [typography rules](https://github.com/typograf/typograf/blob/dev/docs/RULES.ru.md).

By default, uses [`DEFAULT_TYPOGRAF_CONFIG`](./src/typograf.ts) rules.

Example of customizing typograph rules:

```ts
plugins: [
    require.resolve('@gravity-ui/i18n-babel-plugin', {
        typograf: {
            enabled: ['common/nbsp/afterNumber', 'common/nbsp/afterParagraphMark'],
            disabled: ['common/symbols/cf', 'common/space/trimRight', 'common/space/trimLeft'],
        }
    })
],
```

Example of disabling typograph:

```ts
plugins: [
    require.resolve('@gravity-ui/i18n-babel-plugin', {
        typograf: false,
    })
],
```

### root

Allows limiting the plugin's scope. The plugin will not process files outside the specified scope.

Type: `string`.

Default: `src`.
