# @gravity-ui/i18n-optimize-plugin


Плагин для оптимизации поставки файлов с переводами. Можно использовать с webpack, rspack и vite.

Под капотом использует [`i18n-babel-plugin`](../i18n-babel-plugin/README.md).

*Трансформирует файлы `i18n.ts`:*

- Удаляет meta из сообщений (id, description, etc.)
- Преобразует markdown в html (при `meta.markdown === true`)
- Применяет типограф к содержимому ключей
- Создаёт по-локальные чанки и оптимизирует их загрузку в runtime

*TODO:*

- Проверяет синтаксис согласно ICU MessageFormat
- Компилирует ICU MessageFormat в AST
- Заменяет исходные ключи на хэши (позволяет сократить длину ключа)

## Использование

Установите плагин:

```bash
npm install @gravity-ui/i18n-optimize-plugin --save-dev
```

Подключите плагин к сборке. Пример, если вы используете `app-builder` с `rspack`:

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

Пример, если вы используете `app-builder` с `webpack`:

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

## Настройки

### typograf

Позволяет настроить [правила типографа](https://github.com/typograf/typograf/blob/dev/docs/RULES.ru.md).

По-умолчанию использует правила [`DEFAULT_TYPOGRAF_CONFIG`](./src/typograf.ts).

Пример кастомизации правил типографа:

```ts
applyI18nOptimizePlugin(webpackConfig, {
    typograf: {
        enabled: ['common/nbsp/afterNumber', 'common/nbsp/afterParagraphMark'],
        disabled: ['common/symbols/cf', 'common/space/trimRight', 'common/space/trimLeft'],
    }
})
```

Пример отключения типографа:

```ts
applyI18nOptimizePlugin(webpackConfig, {
    typograf: false,
})
```

### optimizeLocaleChunks

Оптимизирует загрузку чанков в runtime: на клиент загружаются переводы только для текущего языка.

Работает только в режиме production для webpack/rspack. По умолчанию отключен (false).

#### Как подключить?

1. Для правильной загрузки чанков необходимо определить переменную `runtimeLanguageVariableName` с текущим языком пользователя в window.

    Например, если вы используете `core`, то вы можете это сделать через `inlineScripts`:

    ```ts
    return res.renderLayout2({
        inlineScripts: [
            `window.I18N_LANG = "${userLanguage}";`,
            'window.YC = window.__DATA__;'
        ],
    })
    ```

    По умолчанию для `runtimeLanguageVariableName` используется `window.I18N_LANG`.

1. Настройте динамический манифест в зависимости от языка пользователя (только для production).

    Например, при использовании `core` это можно сделать через middleware:

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

1. Включите опцию `optimizeLocaleChunks` в настройках плагина.

1. Добавьте строку `.compiled-locales*` в `.arcignore`.

#### Стратегии оптимизации

Параметр `strategy` определяет способ формирования языковых чанков:

- `by-module` (по умолчанию) - для каждого модуля `i18n.ts` создаются отдельные языковые чанки. Это позволяет загружать переводы только для тех модулей, которые используются на странице.

- `all-in-one` - создается общий чанк для каждого языка, содержащий все переводы проекта. Подходит для небольших проектов, где объем переводов невелик.

- `custom` - кастомная стратегия, позволяющая определить собственную логику формирования имен чанков через функцию `getChunkName`.

#### Настройка переменной языка

Параметр `runtimeLanguageVariableName` позволяет указать имя переменной, которая хранит текущий язык. По умолчанию используется `window.I18N_LANG`.

Пример включения оптимизации:

```ts
// Дефолтная стратегия by-module
applyI18nOptimizePlugin(webpackConfig, {
    optimizeLocaleChunks: true,
})

// Стратегия all-in-one
applyI18nOptimizePlugin(webpackConfig, {
    optimizeLocaleChunks: {
        strategy: 'all-in-one',
    },
})

// Изменение runtime-переменной, в которой хранится язык пользователя
applyI18nOptimizePlugin(webpackConfig, {
    optimizeLocaleChunks: {
        strategy: 'by-module',
        runtimeLanguageVariableName: 'window.USER_LANG',
    },
})
```
