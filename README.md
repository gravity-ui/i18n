## I18N utilities

Utilities in the I18N package are designed for internationalization of Yandex Cloud UI services.

### Install

`npm install --save @yandex-cloud/i18n`

### Use examples

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

### Templating and pluralization

The library supports templating. Templated variables are enclosed in double curly brackets, and the values are passed to the i18n function as a key-value dictionary:

#### `keysets.json`

```json
{
  "label_template": "No matches found for "{{inputValue}}" in "{{folderName}}"
}
```

#### `index.js`

```js
i18n('label_template', {inputValue: 'something', folderName: 'somewhere'});  // => No matches found for "something" "somewhere"
```

Pluralization can be used for easy localization of keys that depend on numeric values.
The pluralized key contains 4 values (for the numerals 1, 2-4, 5-9, and 0, respectively). Variable name for pluralization: `count`.
For example:

#### `keysets.json`

```json
{
  "label_seconds": ["{{count}} second is left", "{{count}} seconds are left", "{{count}} seconds are left", "No time left"]
}
```

#### `index.js`

```js
i18n('label_seconds', {count: 1});  // => 1 second
i18n('label_seconds', {count: 3});  // => 3 seconds
i18n('label_seconds', {count: 7});  // => 7 seconds
i18n('label_seconds', {count: 10}); // => 10 seconds
i18n('label_seconds', {count: 0});  // => No time left
```

### Typing

To type the `i18nInstance.i18n` function, follow the steps:

#### Preparation

Prepare a JSON keyset file so that the typing procedure can fetch data. Where you fetch keysets from, add creation of an additional `data.json` file. To decrease the file size and speed up IDE parsing, you can replace all values by `'str'`.

```ts
// Example from the console

async function createFiles(keysets: Record<Lang, LangKeysets>) {
    await mkdirp(DEST_PATH);

    const createFilePromises = Object.keys(keysets).map((lang) => {
        const keysetsJSON = JSON.stringify(keysets[lang as Lang], null, 4);
        const content = umdTemplate(keysetsJSON);
        const hash = getContentHash(content);
        const filePath = path.resolve(DEST_PATH, `${lang}.${hash.slice(0, 8)}.js`);

        // <New lines>
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
        // </New lines>

        return Promise.all([typesPromise, writeFile(filePath, content, 'utf-8')]);
    });

    await Promise.all(createFilePromises);
}
```

#### Connection

In your `ui/utils/i18n` directories (where you configure i18n and export it to be used by all interfaces), import the typing function `I18NFn` with your `Keysets`. After your i18n has been configured, return the casted function

```ts
// Example from the console

import {I18NFn} from '@yandex-cloud/i18n';
// This must be a typed import!
import type Keysets from '../../../dist/public/build/i18n/data.json';

const i18nInstance = new I18N();
type TypedI18n = I18NFn<typeof Keysets>;
// ...
export const ci18n = (i18nInstance.i18n as TypedI18n).bind(i18nInstance, 'common');
export const cui18n = (i18nInstance.i18n as TypedI18n).bind(i18nInstance, 'common.units');
export const i18n = i18nInstance.i18n.bind(i18nInstance) as TypedI18n;
```

#### Additional issues

**Typing logic**

There are several typing use cases:

- Calling a function with keys passed as string literals

```ts
i18n('common', 'label_subnet'); // ok
i18n('dcommon', 'label_dsubnet'); // error: Argument of type '"dcommon"' is not assignable to parameter of type ...
i18n('common', 'label_dsubnet'); // error: Argument of type '"label_dsubnet"' is not assignable to parameter of type ...
```

- Calling a function, passing to it strings that can't be converted into literals (if ts can't derive the string type, it doesn't throw an error)

```ts
const someUncomputebleString = `label_random-index-${Math.floor(Math.random() * 4)}`;
i18n('some_service', someUncomputebleString); // ok

for (let i = 0; i < 4; i++) {
    i18n('some_service', `label_random-index-${i}`); // ok
}
```

- Calling a function, passing to it strings that can be converted into literals

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

**Why typing via a class isn't supported**

This function can break or complicate some i18n scenarios, so it was added as a functional extension. If it proves effective, we would probably add it to a class to avoid casting exported functions.

**Why built-in methods might fail**

Implementing of traversal of nested structures and conditional types using typed built-in function methods is a complex enough task. That's why typing works only when using a direct function call and a `bind` call up to the third argument.

**Why can't I generate a ts file straightforwardly to typecast key values as well?**

You can do that by passing the result type to I18NFn. However, with large file sizes, ts starts consuming huge amounts of resources, slowing down the IDE dramatically, but with JSON file this is not the case.

**Why other methods of the I18N class haven't been typed?**

They can be typed, we'll appreciate if you help implementing it. The case is that other methods are used in 1% of cases.

