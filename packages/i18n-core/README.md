# i18n-core

Библиотека **i18n-core** - это основа для библиотек интернационализации (i18n). Разработан на базе **[@formatjs/intl](https://formatjs.github.io/)**..

## Ключевые особенности:
1. **Framework Agnostic**:
   Разработанный для работы с любым проектом на JavaScript или TypeScript, независимо от того, основан он на React или нет.

1. **Разработан поверх @formatjs/intl**:
   Использует мощные возможности форматирования и кастомизации @formatjs/intl, обеспечивая стандартную для отрасли функциональность локализации.

1. **Модульный и расширяемый**:
   Архитектура позволяет расширять или настраивать функциональность в соответствии с требованиями вашего проекта.

## Примеры использования:
- **React приложения**: легко интегрируется с React проектами, используя [i18n-react](../i18n-react/README.md) библиотеку.
- **Серверные решения**: легко интегрируется с серверными решениями, используя [i18n-node](../i18n-node/README.md) библиотеку.

## Использование

### Фолбек локалей

#### Конфигурация:

- `fallbackLocales` - фолбеки для заданных локалей.
- `defaultFallback` - стандартный фолбек. Он будет использован, если не будет найден фолбек с более высоким приоритетом. Доступные опции:
    - `empty-string` - фолбек на пустую строку.
    - `key` - фолбек на ключ объекта перевода.
    - Одна из используемых в проекте локалей `allowedLocales`, или их список.
- `disableUseLocaleLangAsFallback` - запретить использование языка локали как его фолбек. Подробнее можно посомтреть в алгоритме поиска фолбеков.

#### Алгоритм поиска фолбеков:

Фолбеки для `locale='ru-kz'`:
1. Используем `fallbackLocales['ru-kz']`, если задана
1. Если `disableUseLocaleLangAsFallback === false`:
    - Определяем язык локали, используя [Intl.Locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale). В нашем случае `Intl.Locale('ru-kz').language === 'ru'`
    - Используем `allowedLocales[Intl.Locale('ru-kz').language]`, если задана
    - Используем фолбек для `Intl.Locale('ru-kz').language`. Для поиска используем этот же алгоритм с самого начала.
1. Используем `defaultFallback`

#### Пример использования:

{% list tabs %}
- Использование `fallbackLocales` и `defaultFallback`

   Конфигурация инстанса интернационализации:
   ```typescript
   {
      allowedLocales: ['en', 'ru', 'ru-kz'],
      fallbackLocales: {
         'ru-kz': 'ru',
         'ru': 'en'
      },
      defaultFallback: 'empty-string'
   }
   ```

   Фолбеки по языкам:
   - `en` - пустая строка
   - `ru` - `en`, пустая строка
   - `ru-kz` - `ru`, `en`, пустая строка

- Использование языка локали как фолбек

   Конфигурация инстанса интернационализации:
   ```typescript
   {
      allowedLocales: ['en', 'ru', 'ru-kz'],
      fallbackLocales: {},
      defaultFallback: 'empty-string',
      disableUseLocaleLangAsFallback: false
   }
   ```

   Фолбеки по языкам:
   - `en`, `ru` - пустая строка
   - `ru-kz` - `ru`, пустая строка

{% endlist %}

