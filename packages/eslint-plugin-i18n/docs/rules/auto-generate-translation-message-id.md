# auto-generate-translation-message-id

Проверяет наличие идентификатора в объекте перевода и добавляет его при отсутствии.

## Подключение

Вот пример того, как настроить это правило:

```javascript
module.exports = {
    "@gravity-ui/eslint-plugin-i18n/auto-generate-translation-message-id": [
        "error",
        {
            namespaceMatchers: [/src\/pages\/([^/]+)/, /src\/([^/]+)/],
        },
    ]
}
```

## Опции

- `namespaceMatchers`: Массив регулярных выражений для сопоставления пространства имен сообщения. Это используется для генерации уникального идентификатора для каждого сообщения на основе его пространства имен.

- `idName`: Имя идентификатора. Значение по умолчанию: `id`.

- `generateId`: Функция для генерации идентификаторов.

- `maxValidLength`: Максимальная валидная длина генерируемого идентификатора. Если длина идентификатора превышает это значение, то будет показываться ошибка с необходимостью изменить регулярное выражение в namespaceMatchers, используемое для генерации, либо функцию generateId, либо использовать кастомный идентификатор. Значение по умолчанию: `256`.

- `invalidCharsPattern`: Регулярное выражение для определения запрещенных символов, которые будут заменены значением из `invalidCharsReplacement` или результатом выполнения функции `invalidCharsReplacer`, если она задана. Значение по умолчанию: `/[^\w-_.:/]/g`.

- `invalidCharsReplacement`: Значение, которое будет использоваться для замены запрещенных символов из `invalidCharsPattern`. Значение по умолчанию: `_`.

> **Примечание:** При генерации идентификатора, точки (`.`) в ключе объекта переводов заменяются на нижнее подчеркивание (`_`). Например, если ключ объекта переводов `button.label`, то в идентификаторе он будет представлен как `button_label`.

- `invalidCharsReplacer`: Функция для замены запрещенных символов. Используется в качестве колбэка в `replaceAll(invalidCharsPattern, invalidCharsReplacer)`. Имеет следующую сигнатуру: [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_the_replacement)

- `memberExpressions`: Массив выражений для обозначения переводов, для которых должно применятся правило. Например, если вы хотите применить правило к `intl.createMessages({...})`, вы должны указать `[{member: 'intl', property: 'createMessages'}]`

## Примеры работы правила

Пример **некорректного** кода для этого правила:

```js
// ⛔️ Отсутствует идентификатор у объекта перевода "open"
intl.createMessages({
    open: {
        en: "Open",
        meta: {
            description: ""
        }
    }
})
```

Пример **корректного** кода для этого правила:

```js
// ✅ Есть идентификатор у всех переводов
intl.createMessages({
    open: {
        en: "Open",
        meta: {
            id: 'LandingPage.dST4FxmGt7j9QxJEomNPXf',
            description: ""
        }
    }
})
```
