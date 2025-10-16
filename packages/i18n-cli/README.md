# @gravity-ui/i18n-cli

- Provides i18n configuration for the project

- Provides the `i18n-cli` command for managing language files in the project.


## Project Setup

1. **Install the package:**

    ```bash
    npm i -D @gravity-ui/i18n-cli
    ```

2. **Createthe config file `i18n.config.ts` in the project root:**

    ```ts
    import {defineConfig} from '@gravity-ui/i18n-cli/config';

    export default defineConfig({
        allowedLocales: ['ru', 'en', 'ru-kz', 'en-kz'] as const,
        fallbackLocales: {
            'ru-kz': 'ru',
            'en-kz': 'en',
        },
        defaultFallback: 'en',
        clientIntlModule: {
            path: 'src/shared/i18n/intl.ts',
            alias: '@shared/i18n',
        },
    });
    ```
3. **Import the config in the i18n library instance (i18n-react and i18n-node)**

    ```ts
    import {createIntl} from '@gravity-ui/i18n-react';
    import i18nConfig from '../../../i18n.config';

    const {allowedLocales, fallbackLocales, defaultFallback} = i18nConfig;

    export const intl = createIntl({
        allowedLocales,
        fallbackLocales,
        defaultFallback,
    });
    ```

## Commands

### `create-keys`

Checks the provided file/directory for calls to missing keys and adds them to the `i18n.ts` file.

#### Run for a single file

```bash
npx i18n-cli create-keys src/ui/SomeComponent/SomeComponent.tsx
```

#### Run for all files in a directory

```bash
npx i18n-cli create-keys src/ui/ComponentDirectory
```

### `find-unused`

Recursively search for unused keys starting from the specified directory.

#### Report on unused keys

```bash
npx i18n-cli find-unused src/ui/SomeComponent
```

#### Delete unused keys

```bash
npx i18n-cli find-unused -d src/ui/SomeComponent
```

## Configuration options

### allowedLocales

Type: `string[]`

Allowed locales in the project.

```ts
{
    allowedLocales: ['ru', 'en'] as const,
}
```

### fallbackLocales

Fallbacks for given locales. More details can be found in [i18n-core](../i18n-core/README.md).

### defaultFallback

Default fallback. Used if no higher priority fallback is found. More in [i18n-core](../i18n-core/README.md).

### clientIntlModule

Location of the library instance for the client-side [i18n-react](../i18n-react/README.md) in the project.

```ts
{
    clientIntlModule: {
        // Path to the module with intl library instance
        path: 'src/ui/shared/i18n.ts',

        // TypeScript alias of the module with intl library instance
        alias: '@shared/i18n';
    }
}
```

### serverIntlModule

Server-side library instance location [i18n-node](../i18n-node/README.md) in the project.

```ts
{
    serverIntlModule: {
        // Path to the module containing the intl library instance
        path: 'src/server/utils/i18n.ts',

        // TypeScript alias of the module containing the intl library instance
        alias: undefined,

        // Regular expressions that determine if a module belongs to the server-side
        pathMatchers: [/src\/server\/.+$/]
    }
}
```
