# @gravity-ui/eslint-plugin-i18n

Правила для линтинга i18n.

## Как подключить к проекту

1. Устанавливаем пакет:

    ```sh
    npm i --save-dev @gravity-ui/eslint-plugin-i18n
    ```

2. Подключаем плагин и правила к eslint-конфигу Webpack.

    Добавляем в конфиг клиента (`src/ui/.eslintrc`):

    ```js
    {
        "plugins": ["@gravity-ui/eslint-plugin-i18n"],
        "rules": {
            "@gravity-ui/i18n/detect-incorrect-calls": "error",
            "@gravity-ui/i18n/auto-generate-translation-message-id": "error"
        }
    }
    ```

## Правила

| Name                                                                                                                 | Description                                                                        |
| :--------------------------------------------------------------------------------------------------------------------| :----------------------------------------------------------------------------------|
| [restrict-i18n-imports](docs/rules/restrict-i18n-imports.md)                                                         | Запрещает импорт файлов с текстами (`i18n.ts`) из директорий других уровней. |
| [auto-generate-translation-message-id](docs/rules/auto-generate-translation-message-id.md)                           | Проверяет наличие идентификатора в объекте перевода и добавляет его при отсутствии |
