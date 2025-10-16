# @gravity-ui/i18n-optimize-plugin


Plugin for optimizing translation file delivery. Can be used with webpack, rspack, and vite.

Under the hood, uses [`i18n-babel-plugin`](../i18n-babel-plugin/README.md).

*Transforms `i18n.ts` files:*

- Removes meta from messages (id, description, etc.)
- Converts markdown to html (when `meta.markdown === true`)
- Applies typograf rules to key content
- Creates per-locale chunks and optimizes their runtime loading

*TODO:*

- Validates syntax according to ICU MessageFormat
- Compiles ICU MessageFormat to AST
- Replaces original keys with hashes (allows reducing key length)

## Usage

Install the plugin:

```bash
npm install @gravity-ui/i18n-optimize-plugin --save-dev
```

Connect the plugin to the build. Example if you're using `app-builder` with `rspack`:

```ts
import {defineConfig} from '@gravity-ui/app-builder';
import applyI18nOptimizePlugin from '@gravity-ui/i18n-optimize-plugin/rspack';

export default defineConfig({
    client: {
        rspack: (config) => {
            const plugins = config.plugins ? [...config.plugins] : [];

            return applyI18nOptimizePlugin(config);
        }
    },
});
```

Example if you're using `app-builder` with `webpack`:

```ts
import {defineConfig} from '@gravity-ui/app-builder';
import applyI18nOptimizePlugin from '@gravity-ui/i18n-optimize-plugin/webpack';

export default defineConfig({
    client: {
        webpack: (config) => {
            const plugins = config.plugins ? [...config.plugins] : [];

            return applyI18nOptimizePlugin(config);
        }
    },
});
```

## Settings

### typograf

Allows configuring [typograf rules](https://github.com/typograf/typograf/blob/dev/docs/RULES.ru.md).

By default, uses [`DEFAULT_TYPOGRAF_CONFIG`](./src/typograf.ts) rules.

Example of customizing typograf rules:

```ts
applyI18nOptimizePlugin(webpackConfig, {
    typograf: {
        enabled: ['common/nbsp/afterNumber', 'common/nbsp/afterParagraphMark'],
        disabled: ['common/symbols/cf', 'common/space/trimRight', 'common/space/trimLeft'],
    }
})
```

Example of disabling typograf:

```ts
applyI18nOptimizePlugin(webpackConfig, {
    typograf: false,
})
```

### optimizeLocaleChunks

Optimizes chunk loading at runtime: only translations for the current language are loaded to the client.

Works only in production mode for webpack/rspack. Disabled by default (false).

#### How to enable?

1. For proper chunk loading, you need to define the `runtimeLanguageVariableName` variable with the current user language in window.

    For example, if you're using `core`, you can do this through `inlineScripts`:

    ```ts
    return res.renderLayout2({
        inlineScripts: [
            `window.I18N_LANG = "${userLanguage}";`,
            'window.YC = window.__DATA__;'
        ],
    })
    ```

    By default, `window.I18N_LANG` is used for `runtimeLanguageVariableName`.

1. Configure dynamic manifest depending on user language (production only).

    For example, when using `core` this can be done through middleware:

    ```ts
    import {createMiddleware, getDefaultManifestPath} from '@gravity-ui/ui-core-layout';

    export const layoutMiddleware = createMiddleware(({lang}) => {
        let manifestName = 'assets-manifest.json';

        if (process.env.NODE_ENV === 'production' && lang) {
            manifestName = `assets-manifest.${lang}.json`;
        }

        return getDefaultManifestPath(manifestName);
    });
    ```

1. Enable the `optimizeLocaleChunks` option in plugin settings.

1. Add the line `.compiled-locales*` to `.arcignore`.

#### Optimization Strategies

The `strategy` parameter determines how language chunks are formed:

- `by-module` (default) - separate language chunks are created for each `i18n.ts` module. This allows loading translations only for modules used on the page.

- `all-in-one` - creates a common chunk for each language containing all project translations. Suitable for small projects where translation volume is small.

- `custom` - custom strategy allowing you to define your own chunk naming logic through the `getChunkName` function.

#### Language Variable Configuration

The `runtimeLanguageVariableName` parameter allows specifying the variable name that stores the current language. By default, `window.I18N_LANG` is used.

Example of enabling optimization:

```ts
// Default by-module strategy
applyI18nOptimizePlugin(webpackConfig, {
    optimizeLocaleChunks: true,
})

// all-in-one strategy
applyI18nOptimizePlugin(webpackConfig, {
    optimizeLocaleChunks: {
        strategy: 'all-in-one',
    },
})

// Changing runtime variable that stores user language
applyI18nOptimizePlugin(webpackConfig, {
    optimizeLocaleChunks: {
        strategy: 'by-module',
        runtimeLanguageVariableName: 'window.USER_LANG',
    },
})
```
