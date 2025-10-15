# @gravity-ui/i18n-cli

- Предоставляет конфигурацию i18n для проекта

- Предоставляет команду `i18n-cli` для управления языковыми файлами в проекте.


## Настройка в проекте

1. **Установите пакет:**

    ```bash
    npm i -D @gravity-ui/i18n-cli
    ```

2. **Определите конфигурационный файл `i18n.config.ts` в корне проекта:**

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
3. **Используйте конфигурацию в инстансе i18n-библиотеки (i18n-react и i18n-node)**

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

## Команды

### `create-keys`

Проверяет переданный файл/директорию на вызовы отсутствующих ключей и добавляет их в файл `i18n.ts`.

#### Запуск для отдельного файла

```bash
npx i18n-cli create-keys src/ui/SomeComponent/SomeComponent.tsx
```

#### Запуск для всех файлов в директории

```bash
npx i18n-cli create-keys src/ui/ComponentDirectory
```

### `find-unused`

Рекурсивно ищет неиспользуемые ключи начиная с указанной директории.

#### Отчёт по неиспользуемым ключам

```bash
npx i18n-cli find-unused src/ui/SomeComponent
```

#### Удаление неиспользуемых ключей

```bash
npx i18n-cli find-unused -d src/ui/SomeComponent
```

## Параметры конфигурации

### allowedLocales

Тип: `string[]`

Поддерживаемые проектом локали.

```ts
{
    allowedLocales: ['ru', 'en'] as const,
}
```

### fallbackLocales

Фоллбэки для заданных локалей. Подробнее можно прочитать в [i18n-core](../i18n-core/README.md).

### defaultFallback

Стандартный фоллбэк. Используется, если не будет найден фолбек с более высоким приоритетом. Подробнее можно прочитать в [i18n-core](../i18n-core/README.md).

### clientIntlModule

Расположение инстанса библиотеки для клиентской части [i18n-react](../i18n-react/README.md) в проекте.

```ts
{
    clientIntlModule: {
        // Путь до модуля, в котором находится инстанс библиотеки intl
        path: 'src/ui/shared/i18n.ts',

        // Typescript-алиас модуля, в котором находится инстанс библиотеки intl
        alias: '@shared/i18n';
    }
}
```

### serverIntlModule

Расположение инстанса библиотеки для серверной части [i18n-node](../i18n-node/README.md) в проекте.

```ts
{
    serverIntlModule: {
        // Путь до модуля, в котором находится инстанс библиотеки intl
        path: 'src/server/utils/i18n.ts',

        // Typescript-алиас модуля, в котором находится инстанс библиотеки intl
        alias: undefined,

        // Регулярные выражения, по которым определяется, что модуль относится к серверной части
        pathMatchers: [/src\/server\/.+$/]
    }
}
```
