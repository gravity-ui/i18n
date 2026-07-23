# i18n-node

Библиотека **i18n-node** - это решение для интернационализации (i18n), разработанное для упрощения процесса добавления многоязычной поддержки в приложения Node. Разработан на базе **[i18n-core](../i18n-core/)**.

## Install

```bash
npm install @gravity-ui/i18n-node
```

## Usage

### Инициализация инстанса интернационализации

```typescript
import {createIntl} from '@gravity-ui/i18n-react';

const intl = createIntl({
    allowedLocales: ['ru', 'ru-kz', 'en'],
    fallbackLocales: {
        'ru-kz': 'ru',
        ru: 'en',
    },
    defaultFallback: 'en',
});

const instance = intl.getLocaleInstance('en')
```

### Создание и использование переводов

Для декларации текстов с учетом особенностей языков и культур мы используем синтаксис [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/).

Библиотека предоставляет способа отображения переводов через функцию `t` - простая функция для получения текстовых переводов. Она игнорирует HTML-теги и возвращает строку в чистом виде.  

**Примеры использования:**

{% list tabs %}

- Обычное сообщение

    **Декларация:**
    ```typescript
    const {messages} = intl.createMessages({
        text: {
            en: 'Text',
        },
    })
    const {t} = instance.useMessages(messages);
    ```

    **`t`:**
    ```typescript
    t('text') // -> Text
    ```

- Сообщение с аргументом

    **Декларация:**
    ```typescript
    const {messages} = intl.createMessages({
        activeInstances: {
            en: 'Active instances: {count}',
        },
    })
    const {t} = instance.useMessages(messages);
    ```

    **`t`:**
    ```typescript
    t('activeInstances', {count: 1}) // -> Active instances: 1
    ```

- Markdown

    ⚠️ **Важно!** Для использования нужно [подключить плагин](#i18n-babel-plugin--i18n-optimize-plugin) к сборке проекта.

    **Декларация:**
    ```typescript
    const {messages} = intl.createMessages({
        open: {
            ru: 'Больше примеров синтаксиса в [документации](https://diplodoc.com/docs/ru/index-yfm)',
        }
    })
    const {t} = instance.useMessages(messages);
    ```
    
    **`t`:**
    ```typescript
    t('open') // -> <p>Больше примеров синтаксиса в <a href="https://diplodoc.com/docs/ru/index-yfm">документации</a></p>
    ```

{% endlist %}

### Фолбеки

Вы можете прочитать большое о фолбеках в [i18n-core/fallback-locales](../i18n-core/README.md/#fallback-locales).

### Смена локали

Чтобы изменить локаль используйте метод создалия локального инстанса: `intl.getLocaleInstance([locale])`.

## Конфигурация инстанса интернационализации

- `allowedLocales` - локали, используемые в проекте. Каждый перевод будет содержать значение для каждой локали.

**Конфигурация фолбеков:**
- `fallbackLocales`, `defaultFallback`, `disableUseLocaleLangAsFallback` - вы можете прочитать большое о фолбеках в [i18n-core/fallback-locales](../i18n-core/README.md/#fallback-locales).

**Базовые FormatJS свойства ([документация](https://formatjs.github.io/docs/intl/#intlshape)):**
- `formats`, `defaultFormats` - часть от базовых [formats, defaultFormats](https://formatjs.github.io/docs/intl/#locale-formats-and-messages). Поддерживается только `numbers` формат.
- [`defaultRichTextElements`](https://formatjs.github.io/docs/intl/#defaultrichtextelements)
- [`onError`](https://formatjs.github.io/docs/intl/#onerror)
- `onWarn`

## Методы инстанса интернационализации

- `createMessages` - создание переводов, возвращает `t` функцию.
- `getLocaleInstance` - создать инстанс intl для переданной локали, для последующего получения переводов. Созданные инстансы кешируются.

## Рекомендуемые плагины

### i18n-babel-plugin / i18n-optimize-plugin

Для оптимизации размера поставляемых на клиент ключей нужно использовать плагин:

- [**i18n-babel-plugin**](../i18n-babel-plugin) - если вы используете babel

- [**i18n-optimize-plugin**](../i18n-optimize-plugin) - если вы не используете babel

Плагин выполняет следующие операции с `i18n.ts`:
- Удаляет meta из сообщений (id, description, etc.)
- Преобразует markdown в html (при `meta.markdown === true`)
- Применяет типограф к содержимому ключей

### eslint-plugin-i18n

Для удобства работы рекомендуется использовать существующие eslint правила из пакета [eslint-plugin-i18n](../eslint-plugin-i18n/README.md):
- [auto-generate-translation-message-id](../eslint-plugin-i18n/docs/rules/auto-generate-translation-message-id.md) - авто-генерация `id` для создаваемых переводов. Только для проектов, использующих интеграцию с танкером или другим хранилищем переводов.
- [restrict-i18n-imports](../eslint-plugin-i18n/docs/rules/restrict-i18n-imports.md) - правило запрещает импорт переводов из `i18n.ts` файлов, расположенных на другом уровне вложенности (кроме исключений).Правило позволяет сохранять принятый подход к хранению ключей - рядом с местом использования.

## License

Distributed under the MIT License. See [LICENSE](../../LICENSE) for details.

## For AI agents

The Node.js internationalization layer for Gravity UI services, built on i18n-core with ICU MessageFormat — reach for it to translate server-side strings (errors, logs, API responses) without pulling React into the bundle.

### When to use

- Translating server/Node strings with ICU MessageSyntax (`{count}` plurals, select) on the backend.
- Per-request locale via cached locale instances (`intl.getLocaleInstance(locale)`).
- Bundling only the used translation keys via the companion babel/optimize plugins.

### When not to use

- In a React client app, use [`@gravity-ui/i18n-react`](../i18n-react) — it provides the React `t()`/`<Message>` bindings; this package is server-oriented.
- For raw keyset translation without ICU MessageFormat, the core [`@gravity-ui/i18n`](../i18n) is lighter.

### Common pitfalls

- **Importing `createIntl` from `@gravity-ui/i18n-react` by mistake** — on the server import from `@gravity-ui/i18n-node` to avoid bundling React.
- **Hallucinating `<Message>` on the server** — there is no rich-text component here; use the `t()` function for plain-text translations only.
- **Forgetting `getLocaleInstance`** — translations are resolved per locale instance; call `instance.useMessages(messages)` to obtain the bound `t()` for that locale.
- **Markdown keys without a build plugin** — markdown in keys stays raw unless `i18n-babel-plugin` (Babel) or `i18n-optimize-plugin` (Webpack/Rspack) transforms it at build time.




## Documentation for AI agents

Agent-readable documentation for the installed version is located in `node_modules/@gravity-ui/i18n-node/dist/docs/INDEX.md`.
