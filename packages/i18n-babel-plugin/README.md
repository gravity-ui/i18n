# @gravity-ui/i18n-babel-plugin

Babel-плагин для оптимизации поставки файлов с переводами.

Если вы не используете babel, то вам подойдет [i18n-optimize-plugin](../i18n-optimize-plugin/README.md).

*Трансформирует файлы `i18n.ts`:*

- Удаляет meta из сообщений (id, description, etc.)
- Преобразует markdown в html (при `meta.markdown === true`)
- Применяет типограф к содержимому ключей

*TODO:*

- Проверяет синтаксис согласно ICU MessageFormat
- Компилирует ICU MessageFormat в AST
- Заменяет исходные ключи на хэши (позволяет сократить длину ключа)

## Использование

Установите плагин:

```bash
npm install @gravity-ui/i18n-babel-plugin --save-dev
```

Подключите плагин к сборке. Пример, если вы используете `app-builder`:

```ts
import {defineConfig} from '@gravity-ui/app-builder';

export default defineConfig({
    client: {
        babel: (config) => {
            const plugins = config.plugins ? [...config.plugins] : [];

            return {
                ...config,
                plugins: [
                    ...plugins,
                    require.resolve('@gravity-ui/i18n-babel-plugin')
                ],
            };
        }
    }
});
```

## Настройки

### typograf

Позволяет настроить [правила типографа](https://github.com/typograf/typograf/blob/dev/docs/RULES.ru.md).

По-умолчанию использует правила [`DEFAULT_TYPOGRAF_CONFIG`](./src/typograf.ts).

Пример кастомизации правил типографа:

```ts
plugins: [
    require.resolve('@gravity-ui/i18n-babel-plugin', {
        typograf: {
            enabled: ['common/nbsp/afterNumber', 'common/nbsp/afterParagraphMark'],
            disabled: ['common/symbols/cf', 'common/space/trimRight', 'common/space/trimLeft'],
        }
    })
],
```

Пример отключения типографа:

```ts
plugins: [
    require.resolve('@gravity-ui/i18n-babel-plugin', {
        typograf: false,
    })
],
```

### root

Позволяет ограничить область работы плагина. Плагин не будет обрабатывать файлы за пределами заданной области.

Тип: `string`.

По-умолчанию: `src`.
