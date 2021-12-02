## Утилиты I18N

Утилиты пакета I18N предназначены для интернационализации UI-сервисов Yandex Cloud.

### Установка
`npm install --save @yandex-cloud/i18n`

### Примеры использования
#### `keysets/en.json`
```json
{
  "wizard": {
    "label_error-widget-no-access": "No access to the chart"
  }
}
```
#### `keysets/ru.json`
```json
{
  "wizard": {
    "label_error-widget-no-access": "Нет доступа к чарту"
  }
}
```
#### `index.js`
```js
const ru = require('./keysets/ru.json');
const en = require('./keysets/en.json');

const {I18N} = require('../src');

const i18n = new I18N();
i18n.registerKeysets('ru', ru);
i18n.registerKeysets('en', en);

I18N.setDefaultLang('ru');
console.log(
    i18n.i18n('wizard', 'label_error-widget-no-access')
); // -> "Нет доступа к чарту"

I18N.setDefaultLang('en');
console.log(
    i18n.i18n('wizard', 'label_error-widget-no-access')
); // -> "No access to the chart

// Keyset allows for a simpler translations retrieval
const keyset = i18n.keyset('wizard');
console.log(
    keyset('label_error-widget-no-access')
); // -> "No access to the chart"


I18N.setDefaultLang('ru');
console.log(
    keyset('label_error-widget-no-access')
); // -> "Нет доступа к чарту"

// Checking if keyset has a key
if (i18n.has('wizard', 'label_error-widget-no-access')) {
    i18n.i18n('wizard', 'label_error-widget-no-access')
}
```
### Шаблонизация и плюрализация
Библиотека поддерживает шаблонизацию. Шаблонизируемые переменные заключаются в двойные фигурные скобки, а значения передаются в функцию i18n в форме key-value словаря:
#### `keysets.json`
```json
{
  "label_template": "По запросу «{{inputValue}}» в месте «{{folderName}}» ничего не найдено"
}
```

#### `index.js`
```js
i18n('label_template', {inputValue: 'не знаю что', folderName: 'не знаю где'});  // => По запросу «не знаю что» в месте «не знаю где» ничего не найдено
```

Для удобной локализации ключей, зависящих от числового значения, можно использовать плюрализацию.
Плюрализованный ключ содержит 4 значения (для числительных 1, 2-4, 5-9 и 0 соответственно). Имя переменной для плюрализации - `count`.
Например:
#### `keysets.json`
```json
{
  "label_seconds": ["Осталась {{count}} секунда", "Осталось {{count}} секунды", "Осталось {{count}} секунд", "Времени не осталось"]
}
```
#### `index.js`
```js
i18n('label_seconds', {count: 1});  // => 1 секунда
i18n('label_seconds', {count: 3});  // => 3 секунды
i18n('label_seconds', {count: 7});  // => 7 секунд
i18n('label_seconds', {count: 10}); // => 10 секунд
i18n('label_seconds', {count: 0});  // => Времени не осталось
```

### Типизация

Для того чтобы функцию `i18nInstance.i18n` сделать типизированной, нужно выполнить несколько шагов:

#### Подготовка

Нужно подготовить кейсет файл в json для того, чтобы типизация подтянула данные. В месте скачивания кейсетов добавьте создание рядом дополнительного файла `data.json`, для уменьшения размера файла и ускорения парсинга IDE можно все значения заменить на `'str'`.

```ts
// Пример из консоли

async function createFiles(keysets: Record<Lang, LangKeysets>) {
    await mkdirp(DEST_PATH);

    const createFilePromises = Object.keys(keysets).map((lang) => {
        const keysetsJSON = JSON.stringify(keysets[lang as Lang], null, 4);
        const content = umdTemplate(keysetsJSON);
        const hash = getContentHash(content);
        const filePath = path.resolve(DEST_PATH, `${lang}.${hash.slice(0, 8)}.js`);

        // <Новые строки>
        let typesPromise;

        if (lang === 'ru') {
            const keyset = keysets[lang as Lang];
            Object.keys(keyset).forEach((keysetName) => {
                const keyPhrases = keyset[keysetName];
                Object.keys(keyPhrases).forEach((keyName) => {
                    // mutate object!
                    keyPhrases[keyName] = 'str';
                });
            });

            const JSONForTypes = JSON.stringify(keyset, null, 4);
            typesPromise = writeFile(path.resolve(DEST_PATH, `data.json`), JSONForTypes, 'utf-8');
        }
        // </Новые строки>

        return Promise.all([typesPromise, writeFile(filePath, content, 'utf-8')]);
    });

    await Promise.all(createFilePromises);
}

```

#### Подключение
В ваших `ui/utils/i18n` (месте, где конфигурируете i18n и экспортируете для дальнейшего использования всеми интерфейсами) нужно импортировать типизирующую функцию `I18NFn` с вашим `Keysets` и после конфигурирования вашего i18n возвращать закастованную функцию

```ts
// Пример из консоли

import {I18NFn} from '@yandex-data-ui/i18n';
// обязательно типизированный импорт!
import type Keysets from '../../../dist/public/build/i18n/data.json';

const i18nInstance = new I18N();
type TypedI18n = I18NFn<typeof Keysets>;
// ...
export const ci18n = (i18nInstance.i18n as TypedI18n).bind(i18nInstance, 'common');
export const cui18n = (i18nInstance.i18n as TypedI18n).bind(i18nInstance, 'common.units');
export const i18n = i18nInstance.i18n.bind(i18nInstance) as TypedI18n;
```

#### Дополнительные вопросы

**Логика работы типизации**

Есть несколько кейсов использования:

- Вызов функции с передачей ключей литералами строк

```ts
i18n('common', 'label_subnet'); // ok
i18n('dcommon', 'label_dsubnet'); // error: Argument of type '"dcommon"' is not assignable to parameter of type ...
i18n('common', 'label_dsubnet'); // error: Argument of type '"label_dsubnet"' is not assignable to parameter of type ...
```

- Вызов функции с передачей строк, которые нельзя вычислить в литералы (если ts не может понять, что за строка ему передаётся, он не ругается на неё)

```ts
const someUncomputebleString = `label_random-index-${Math.floor(Math.random() * 4)}`;
i18n('some_service', someUncomputebleString); // ok

for (let i = 0; i < 4; i++) {
    i18n('some_service', `label_random-index-${i}`); // ok
}
```

- Вызов функции с передачей строк, которые можно вычислить в литералы

```ts
const labelColors = ['red', 'green', 'yelllow', 'white'] as const;
for (let i = 0; i < 4; i++) {
    i18n('some_service', `label_color-${labelColors[i]}`); // ok
}

const labelWrongColors = ['red', 'not-existing', 'yelllow', 'white'] as const;
for (let i = 0; i < 4; i++) {
    i18n('some_service', `label_color-${labelWrongColors[i]}`); // error: Argument of type '"not-existing"' is not assignable to parameter of type ...
}
```

**Почему нет типизации через класс**

Данная функция может поломать или усложнить некоторые сценарии использования i18n, поэтому была добавлена в качестве дополнительной функциональности. Если хорошо себя проявит, то в будущем можно будет добавить в класс, чтобы не кастовать экспортируемые функции.

**Почему могут не работать встроенные методы**

Типизация встроенных методов функций достаточно сложна для реализации обхода вложенных структур и условных типов. Именно поэтому типизация работает только в случае использования непосредственного вызова функции и вызова `bind` до третьего аргумента.

**Почему нельзя генерировать сразу ts файл, чтобы типизировались и значения ключей**

Можно, и вы можете реализовать у себя этот функционал, передавая результирующий тип в I18NFn. Но при больших объемах файла ts начинает есть столько ресурсов, что это сильно тормозит IDE, чего не происходит с JSON файлом.

**Почему не типизированы остальные методы класса I18N**

Их можно типизировать, будет круто, если поможете это сделать. Просто остальные методы используются в 1% случаев.
