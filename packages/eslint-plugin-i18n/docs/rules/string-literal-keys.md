# string-literal-keys

Запрещает использовать в качестве ключей все кроме inline строк.

Пример подключения правила:

```javascript
module.exports = {
    "@gravity-ui/eslint-plugin-i18n/string-literal-keys": ["error", {}]
}
```

## Опции

- `i18nSpecifier`: Массив имен функций i18n, для которых будет работать правило - по умолчанию `["t"]`, но рекомендуется явно включить сюда и `commonT` (вызов общих i18n проекта) - `["t", "commonT"]`.

- `jsxI18nSpecifier`: Массив имен jsx i18n компонентов, для которых будет работать правило - по умолчанию `["Message"]`, но рекомендуется явно включить сюда и `CommonMessage` (вызов общих i18n проекта) - `["Message", "CommonMessage"]`.

```javascript
module.exports = {
    "@gravity-ui/eslint-plugin-i18n/string-literal-keys": ["error", {
        i18nSpecifier: ["t", "commonT"],
        jsxI18nSpecifier: ["Message", "CommonMessage"]
    }]
}
```

Имена `"t"`, `"commonT"`, `"Message"`, `"CommonMessage"` могут отличаться от имен в вашем проекте.

## Примеры работы правила

Пример **некорректного** кода для этого правила:

```js
import {t, Message} from '../i18n'

const keyId = "someId";
// ⛔️ Недопустимый формат ключа
t(keyId) || <Message id={keyId} />
```

Пример **корректного** кода для этого правила:

```js
import {t, Message} from '../i18n'

// ✅ Допустимые форматы
t("someId") || <Message id={"someId"} />
```
