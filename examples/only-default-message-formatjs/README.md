# Особенности

- Тексты исходного языка описываются в коде
- id сообщения генерируется автоматически только один раз для каждого сообщения и остается неизменным! Генерация происходит при помощи eslint-плагина.

**Плюсы:**

- Улучшается DX так как тексты можно описывать в коде и не лезть в json-ы. Также не нужно придумывать ключи.
- Разработчик не думает о других языках, этим занимаются только переводчики

**Минусы:**

- Разработчик не сможет заранее увидеть как выглядит интерфейс на второстепенном языке
- Изменения текста второстепенного языка всегда осуществляются через Танкер и затем должны вливаться в trunk

**Что придется доделывать:**

- Babel-плагин для инлайна ключей при сборке проекта
- Webpack-плагин для инлайна ключей
- i18n-sync должен научиться обрабатывать формат formatjs
- Раскладыватель текстов исходного языка в defaultMessage по месту использования (при пулле из Танкера). Тулза обратная экстрактингу.

## Флоу работы

![flow](./flow.png =800x)

## Как поставлять тексты

По-умолчанию в development будут показываться тексты, определенные в defaultMessage. По необходимости можно в development подгружать другие локали.

Но как поставлять тексты в production? Есть два варианта и вы можете выбрать любой.

### Inline текстов для всех языков сразу (babel)

Испльзуйте babel-плагин, который будет регистрировать ключи с переводами на всех языках.
Регистрирует ключи, которые используются в текущем модуле.

Пример как преобразуется модуль:

```diff
import { commonMessages, intl } from "@shared/i18n";

+ intl.addMessages({
+    ru: {
+        'pages.AboutPage.4d4b965543303cec8425b75a4a839242': 'О нас',
+        'pages.AboutPage.098fg23303cec8425b75a4a839242': `{countOffices, plural,
+            =0 {У нас нет офисов}
+            =1 {У нас всего один офис}
+            other {У нас # офисов}
+        }`
+    },
+    en: {
+        'pages.AboutPage.4d4b965543303cec8425b75a4a839242': 'About us',
+        'pages.AboutPage.098fg23303cec8425b75a4a839242': `{countOffices, plural,
+            =0 {We don't have offices}
+            =1 {We have only one office}
+            other {We have # offices}
+        }`,
+    },
+ })

const getOfficesText = (countOffices: number) =>
    intl.formatMessage({
        id: 'pages.AboutPage.098fg23303cec8425b75a4a839242',
-        description: 'Количество офисов в стране',
-        defaultMessage: `{countOffices, plural,
-            =0 {У нас нет офисов}
-            =1 {У нас всего один офис}
-            other {У нас # офисов}
-        }`,
    }, {countOffices})

export const AboutPage = () => (
    <div>
        <h1>Тайтл страницы:
            {intl.formatMessage({
                id:'pages.AboutPage.4d4b965543303cec8425b75a4a839242',
-                description: 'Тайтл страницы о нас',
-                defaultMessage: 'О нас',
            })}
        </h1>
        <br />
        <h3>
            Сколько у нас офисов (0):
            {getOfficesText(0)}
        </h3>
        <h3>
            Сколько у нас офисов (1):
            {getOfficesText(1)}
        </h3>
        <h3>
            Сколько у нас офисов (5):
            {getOfficesText(5)}
        </h3>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{intl.formatMessage(commonMessages.create)}</button>
        <button>{intl.formatMessage(commonMessages.delete)}</button>
    </div>
)
```

Что произойдет с common-сообщениями?

```diff
import { defineMessages } from "react-intl";
+ import { intl } from "@shared/i18n";

+ intl.addMessages({
+    ru: {
+        'common.create': 'Создать',
+        'common.delete': 'Удалить'
+    },
+    en: {
+        'common.create': 'Create',
+        'common.delete': 'Delete'
+    },
+ })

export const commonMessages = defineMessages({
    create: {
        id: 'common.create',
-        description: 'Общий текст "Создать". Используем в экшенах.',
-        defaultMessage: 'Создать'
    },
    delete: {
        id: 'common.delete',
-        description: 'Общий текст "Удалить". Используем в экшенах.',
-        defaultMessage: 'Удалить'
    }
})
```

### Inline  (webpack)

Доработаем существующий webpack-плагин, который будет генерировать локализованные ассеты под определенные локали (просто будет подставлять сообщение в defaultMessage).

Пример как преобразуется модуль под EN-локаль:

```diff
import { commonMessages, intl } from "@shared/i18n";

const getOfficesText = (countOffices: number) =>
    intl.formatMessage({
        id: 'pages.AboutPage.098fg23303cec8425b75a4a839242',
-        description: 'Количество офисов в стране',
-        defaultMessage: `{countOffices, plural,
-            =0 {У нас нет офисов}
-            =1 {У нас всего один офис}
-            other {У нас # офисов}
-        }`,
+        defaultMessage: `{countOffices, plural,
+            =0 {We don't have offices}
+            =1 {We have only one office}
+            other {We have # offices}
+        }
    }, {countOffices})

export const AboutPage = () => (
    <div>
        <h1>Тайтл страницы:
            {intl.formatMessage({
                id:'pages.AboutPage.4d4b965543303cec8425b75a4a839242',
-                description: 'Тайтл страницы о нас',
-                defaultMessage: 'О нас',
+                defaultMessage: 'About us',
            })}
        </h1>
        <br />
        <h3>
            Сколько у нас офисов (0):
            {getOfficesText(0)}
        </h3>
        <h3>
            Сколько у нас офисов (1):
            {getOfficesText(1)}
        </h3>
        <h3>
            Сколько у нас офисов (5):
            {getOfficesText(5)}
        </h3>
        <br />
        <h3>А тут пример common-текстов:</h3>
        <button>{intl.formatMessage(commonMessages.create)}</button>
        <button>{intl.formatMessage(commonMessages.delete)}</button>
    </div>
)
```

Что произойдет с common-сообщениями?

```diff
import { defineMessages } from "react-intl";
+ import { intl } from "@shared/i18n";

+ intl.addMessages({
+    ru: {
+        'common.create': 'Создать',
+        'common.delete': 'Удалить'
+    },
+    en: {
+        'common.create': 'Create',
+        'common.delete': 'Delete'
+    },
+ })

export const commonMessages = defineMessages({
    create: {
        id: 'common.create',
-        description: 'Общий текст "Создать". Используем в экшенах.',
-        defaultMessage: 'Создать'
+        defaultMessage: 'Create'
    },
    delete: {
        id: 'common.delete',
-        description: 'Общий текст "Удалить". Используем в экшенах.',
-        defaultMessage: 'Удалить'
+        defaultMessage: 'Delete'
    }
})
```
