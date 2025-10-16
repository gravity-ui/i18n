# i18n-react

Библиотека **i18n-react** - это решение для интернационализации (i18n), разработанное для упрощения процесса добавления многоязычной поддержки в приложения React. Разработан на базе **[i18n-core](../i18n-core/)**.

## Использование

### Установка

```bash
npm install @gravity-ui/i18n-react
```

### Создание инстанса интернационализации

```typescript
import {createIntl} from '@gravity-ui/i18n-react';

const intl = createIntl({
    locale: 'en',
    allowedLocales: ['ru', 'ru-kz', 'en'],
    fallbackLocales: {
        'ru-kz': 'ru',
        ru: 'en',
    },
    defaultFallback: 'en',
});
```

### Создание и использование переводов

Для декларации текстов с учетом особенностей языков и культур мы используем синтаксис [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/).

Библиотека предоставляет два основных способа для отображения переводов:  

1. Функция `t` 
   Простая функция для получения текстовых переводов. Она игнорирует HTML-теги и возвращает строку в чистом виде.  
   
2. Компонент `<Message />`  
   Компонент, который поддерживает rich text, позволяя встраивать HTML-теги и другие элементы в переводы.


**Примеры использования:**

{% list tabs %}

- Обычное сообщение

    **Декларация:**
    ```typescript
    const {t, Message} = intl.createMessages({
        text: {
            en: 'Text',
        },
    })
    ```

    **`t`:**
    ```typescript
    t('text') // -> Text
    ```

    **`<Message />`:**
    ```typescript
    <Message id="text" /> // -> Text
    ```

- Сообщение с аргументом

    **Декларация:**
    ```typescript
    const {t, Message} = intl.createMessages({
        activeInstances: {
            en: 'Active instances: {count}',
        },
    })
    ```

    **`t`:**
    ```typescript
    t('activeInstances', {count: 1}) // -> Active instances: 1
    ```

    **`<Message />`:**
    ```typescript
    <Message id="activeInstances" values={{count: 1}} /> // -> Active instances: 1
    ```

- Rich text

    ⚠️ **Важно!** Использование возможно только в React через компонент `Message`.

    **Декларация:**
    ```typescript
    const {Message} = intl.createMessages({
        createResourceEmptyText: {
            en: 'Вы можете перейти на страницу <link>создания ресурса</link>',
        },
    })
    ```

    **`<Message />`:**
    ```tsx
    <Message 
        id="createResourceEmptyText" 
        values={{
            link: chunks => <RouterLink to="/create">{chunks}</RouterLink>
        }}
    />
    ```

- Markdown

    ⚠️ **Важно!** Для использования нужно [подключить плагин](#i18n-babel-plugin--i18n-optimize-plugin) к сборке проекта.

    **Декларация:**
    ```typescript
    const {t, Message} = intl.createMessages({
        open: {
            ru: 'Больше примеров синтаксиса в [документации](https://diplodoc.com/docs/ru/index-yfm)',
        }
    })
    ```
    
    **`t`:**
    ```typescript
    t('open') // -> <p>Больше примеров синтаксиса в <a href="https://diplodoc.com/docs/ru/index-yfm">документации</a></p>
    ```

    **`<Message />`:**

    * Необходимо использовать "ignoreTag" для Message компонента

    ```typescript
    <Message id='open' ignoreTag > // -> <p>Больше примеров синтаксиса в <a href="https://diplodoc.com/docs/ru/index-yfm">документации</a></p>
    ```

{% endlist %}

### Фолбеки

Вы можете прочитать большое о фолбеках в [i18n-core/fallback-locales](../i18n-core/README.md/#fallback-locales).

## Конфигурация инстанса интернационализации

- `locale` - изначальная локаль.
- `allowedLocales` - локали, используемые в проекте. Каждый перевод будет содержать значение для каждой локали.

**Конфигурация фолбеков:**
- `fallbackLocales`, `defaultFallback`, `disableUseLocaleLangAsFallback` - вы можете прочитать большое о фолбеках в [i18n-core/fallback-locales](../i18n-core/README.md/#fallback-locales).

**Базовые FormatJS свойства ([документация](https://formatjs.github.io/docs/react-intl/api#intlshape)):**
- `formats`, `defaultFormats` - часть от базовых [formats, defaultFormats](https://formatjs.github.io/docs/react-intl/api#locale-formats-and-messages). Поддерживается только `numbers` формат.
- [`defaultRichTextElements`](https://formatjs.github.io/docs/react-intl/api#defaultrichtextelements)
- [`textComponent`](https://formatjs.github.io/docs/react-intl/api#defaultrichtextelements)
- [`wrapRichTextChunksInFragment`](https://formatjs.github.io/docs/react-intl/api#wraprichtextchunksinfragment)
- [`onError`](https://formatjs.github.io/docs/react-intl/api#onerror)
- `onWarn`

## Методы инстанса интернационализации

- `createMessages` - создание переводов, возвращает `t` функцию и `<Message />` компонент.
- `setLocale` - изменить текущую локаль.
- `getLocale` - получить текущую локаль.
- `getCurrentFallbackLocales` - получить список приоретезированных фолбеков для текущей локали.

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
