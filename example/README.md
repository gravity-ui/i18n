# Демонстрационный проект i18n

Что можно увидеть в проекте:

- Покомпонентную структуру хранения текстов

- Примеры синтаксиса ICU Message Format

- Подключение библиотеки [i18n-react](./src/shared/i18n/intl.tsx)

- Конфигурацию для [i18n-cli](./i18n.config.ts)

- Подключение правил для линтера [eslint-plugin-i18n](./eslint.config.js)

- Подключение плагина [i18n-optimize-plugin](../packages/i18n-optimize-plugin/README.md) для оптимизации текстов и поддержки markdown

- Настройку [конфигурации](./.i18nrc.json) для взаимодействия с танкером через [i18n-sync](../packages/i18n-sync/README.md)


## Запуск проекта

1. Установите pnpm

    ```bash
    npm i -g pnpm@9.12.3
    ```

1. Установите зависимости

    ```bash
    pnpm i
    ```

1. Запустите проект

    ```bash
    pnpm run dev
    ```
