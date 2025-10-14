# 🌍 Репозиторий i18n инструментов Gravity-UI

В данном репозитории хранятся общие утилиты, библиотеки и плагины, используемые для i18n в Gravity-UI.

## Полезные ссылки

- [Демонстрационный проект](./example/README.md)

## Библиотеки

| Название                                                    | Описание                                                         | Последняя версия                                                |
|-------------------------------------------------------------|------------------------------------------------------------------|----------------------------------------------------------------|
| [i18n-core](./packages/i18n-core/README.md)                 | Корневая библиотека i18n. Обвязка над FormatJS.                  |  |
| [i18n-react](./packages/i18n-react/README.md)               | Библиотека i18n для клиентских приложений на React.              |  |
| [i18n-node](./packages/i18n-node/README.md)                 | Библиотека i18n для серверных приложений.                        |  |
| [eslint-plugin-i18n](./packages/eslint-plugin-i18n/README.md) | Правила линтинга eslint.                                       |  |
| [i18n-cli](./packages/i18n-cli/README.md)                   | Инструмент для операций над языковыми файлами.                   |  |
| [i18n-babel-plugin](./packages/i18n-babel-plugin/README.md) | Babel-плагин для оптимизации поставки языковых файлов.           |  |
| [i18n-optimize-plugin](./packages/i18n-optimize-plugin/README.md) | Webpack/Rspack плагин для оптимизации поставки языковых файлов. |  |
| [i18n-sync](./packages/i18n-sync/README.md)                 | Инструмент для синхронизации переводов проекта с Танкером.       |  |
| [vscode-extension](./packages/vscode-extension/README.md) | VS Code расширение для создания файлов локализации | |

## Разработка

1. Установите pnpm

    ```bash
    npm i -g pnpm@9.12.3
    ```

1. Установите зависимости

    ```bash
    pnpm i
    ```

1. Запускайте команды через утилиту `nx`

    ```bash
    # Запуск сборки пакета i18n-sync
    pnpm nx build @gravity-ui/i18n-sync

    # Запуск typecheck пакета i18n-cli
    pnpm nx typecheck @gravity-ui/i18n-cli

    # Запуск команды lint для всех пакетов
    pnpm nx run-many --target=lint --parallel
    ```
