# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-04-23 15:51:00 - Log of updates made.

2025-04-23 16:05:00 - Добавлена детальная информация о паттернах в пакетах i18n-core, i18n-react и i18n-node.

## Coding Patterns

### Компонентный подход к хранению текстов

```typescript
// i18n.ts
import {intl} from '@shared/i18n';

export const {t, Message} = intl.createMessages({
    key1: {
        ru: 'Значение на русском',
        en: 'Value in English',
        'ru-kz': null, // Будет использован фолбэк на ru
        'en-kz': null,
        meta: {
            id: 'Component.uniqueId',
            description: 'Описание для переводчика',
        },
    },
    // Другие ключи...
});

// Component.tsx
import {t, Message} from './i18n';

export const Component = () => (
    <div>
        {/* Использование функции t */}
        <h1>{t('key1')}</h1>
        
        {/* Использование компонента Message */}
        <Message id="key1" />
    </div>
);
```

### Общие тексты

```typescript
// common.i18n.ts
import {intl} from './intl';

export const {t: commonT, Message: CommonMessage} = intl.createMessages({
    Создать: {
        ru: 'Создать',
        en: 'Create',
        // Другие локали...
        meta: {
            id: 'shared.uniqueId',
        },
    },
    // Другие общие тексты...
});

// Component.tsx
import {commonT} from '@shared/i18n';

export const Component = () => (
    <button>{commonT('Создать')}</button>
);
```

### Rich Text и Markdown

```typescript
// i18n.ts - с поддержкой markdown
export const {t, Message} = intl.createMessages({
    markdownText: {
        ru: 'Читай больше в [документации](#){target=_blank}.',
        en: 'Read more in [documentation](#){target=_blank}.',
        meta: {
            id: 'Component.uniqueId',
            markdown: true, // Включение поддержки markdown
        },
    },
});

// i18n.ts - с поддержкой rich text
export const {t, Message} = intl.createMessages({
    richText: {
        ru: 'Rich <b>text</b>',
        en: 'Rich <b>text</b>',
        meta: {
            id: 'Component.uniqueId',
        },
    },
});

// Component.tsx
export const Component = () => (
    <div>
        {/* Markdown рендерится как HTML */}
        <div dangerouslySetInnerHTML={{__html: t('markdownText')}} />
        
        {/* Rich text с кастомными компонентами */}
        {t(
            'richText',
            {
                b: (chunks) => <b>{chunks}</b>,
            }
        )}
        
        {/* Или через компонент Message */}
        <Message
            id="richText"
            values={{
                b: (chunks) => <b>{chunks}</b>,
            }}
        />
    </div>
);
```

## Architectural Patterns

### Монорепозиторий с пакетами

Проект организован как монорепозиторий с несколькими пакетами:

```
packages/
  ├── i18n-core/         # Корневая библиотека
  ├── i18n-react/        # Библиотека для React
  ├── i18n-node/         # Библиотека для Node.js
  ├── eslint-plugin-i18n/ # Правила линтинга
  ├── i18n-cli/          # CLI инструмент
  ├── i18n-babel-plugin/ # Babel плагин
  └── i18n-optimize-plugin/ # Webpack/Rspack плагин
```

### Конфигурация i18n

```typescript
// i18n.config.ts
import {defineConfig} from '@gravity-ui/i18n-cli/config';

export default defineConfig({
    allowedLocales: ['ru', 'en', 'ru-kz', 'en-kz'] as const,
    fallbackLocales: {
        'ru-kz': 'ru',
        'en-kz': 'en',
    },
    defaultFallback: 'en',
    
    clientIntlModule: {
        path: 'src/shared/i18n/intl.tsx',
        alias: '@shared/i18n',
    },
});
```

### Интеграция с React

```typescript
// intl.tsx
import {createIntl} from '@gravity-ui/i18n-react';
import i18nConfig from '../../../i18n.config';

const {allowedLocales, fallbackLocales, defaultFallback} = i18nConfig;

export const intl = createIntl({
    allowedLocales,
    fallbackLocales,
    defaultFallback,
    locale: 'ru', // Или из пользовательских настроек
    defaultRichTextElements: {
        p: (chunks) => <p>{chunks}</p>,
        h1: (chunks) => <h1>{chunks}</h1>,
        // Другие элементы...
    },
    onError: (error) => {
        console.error(error);
    },
    wrapRichTextChunksInFragment: true,
});
```

## Testing Patterns

### Тестирование миграции

```typescript
// useI18nFile.spec.ts
it('Case 1', () => {
    const project = new Project();
    const sourceFile = project.createSourceFile(
        TEST_FILE_NAME,
        `
        import {i18n} from 'shared/i18n'

        i18n('keyset', 'key', {count: 1, other: 'text'})
        `,
    );

    useI18nFile({
        sourceFile,
        params: {
            messagesToReplace: [
                {
                    key: 'key',
                    keyset: 'keyset',
                    newKey: 'keyset.key',
                    newKeyPath: 'i18n.ts',
                    tMethodName: 't',
                },
            ],
        },
        config: baseConfig,
    });

    expect(normalizeStr(sourceFile.getFullText())).toBe(
        normalizeStr(`
        import {t} from './i18n'

        t('keyset.key', {count: 1, other: 'text'})
        `),
    );
});
```

## Паттерны интеграции с FormatJS в пакете i18n-sync

### Плагин (Plugin)

Пакет i18n-sync использует паттерн "Плагин" для поддержки различных форматов хранения переводов, включая FormatJS:

```typescript
// packages/i18n-sync/src/fs/loaders/getProjectLoader.ts
case 'formatjs': {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loader = require('./formatjs/FormatJsProjectLoader')
        .FormatJsProjectLoader as FormatJsProjectLoaderType;
    return new loader(options);
}
```

Этот паттерн позволяет:
- Расширять функциональность системы без изменения основного кода
- Добавлять поддержку новых форматов хранения переводов
- Изолировать специфичную для FormatJS логику в отдельном модуле

### Адаптер (Adapter) для FormatJS

В классе FormatJsProjectLoader используется паттерн "Адаптер" для преобразования между внутренним форматом i18n-sync и форматом FormatJS:

```typescript
// packages/i18n-sync/src/fs/loaders/formatjs/project.ts
const translations = Object.values(key.getTranslationsByLanguage()).reduce<Message>(
    (acc, current) => ({
        ...acc,
        [current.getLang()]: transformTankerValueToFormatJS(current.getValue()),
    }),
    {},
);

translationsFilesToMesages[placementInfo.translationFilePath].push({
    message: {
        ...translations,
        meta: {
            id,
            description: key.getContext(),
            markdown: placementInfo.meta?.markdown,
        },
    } as Message,
    meta: {
        objectKey: placementInfo.objectKey,
    },
});
```

Этот паттерн позволяет:
- Преобразовывать данные между форматом Танкера и форматом FormatJS
- Сохранять метаданные переводов в формате, понятном FormatJS
- Обеспечивать совместимость между различными системами

### Стратегия (Strategy) для обработки плюральных форм

При работе с плюральными формами используется паттерн "Стратегия":

```typescript
// packages/i18n-sync/src/fs/loaders/formatjs/project.ts
if (isPluralKey) {
    // Если для ключа есть хоть один перевод в плюральной версии, то переводы для других локалей тоже должны быть плюральными.
    const emptyPluralValue = fillEmptyPluralForms({});
    keyModel.getLanguages().forEach((lang) => {
        const translation = keyModel.getTranslation(lang);
        if (!translation.isPlural()) {
            if (translation.getValue() === '') {
                translation.setValue(emptyPluralValue);
            } else {
                throw new Error(
                    `У ключа ${key} в кейсете ${keyset} различия в типах переводов. Ключ плюральный, но для языка ${lang} задан обычный текст`,
                );
            }
        }
    });
}
```

Этот паттерн позволяет:
- Выбирать различные стратегии обработки плюральных форм
- Обеспечивать консистентность плюральных форм между различными локалями
- Предотвращать ошибки при смешивании плюральных и неплюральных переводов

## Паттерны в пакете i18n-sync

### Фасад (Facade)

Пакет i18n-sync использует паттерн "Фасад" для предоставления простого интерфейса к сложной системе взаимодействия с Танкером:

```typescript
// packages/i18n-sync/src/index.ts
export {default as TankerClient} from './tanker/TankerClient';
export {default as Loader} from './fs/Loader';
export {default as Config} from './config/Config';
export {prepareKeysets, readKeysets} from './prepare';
```

Этот паттерн позволяет:
- Скрыть сложность взаимодействия с API Танкера
- Предоставить простой и понятный интерфейс для работы с переводами
- Изолировать клиентский код от изменений в API Танкера

### Адаптер (Adapter)

В классе TankerClient используется паттерн "Адаптер" для преобразования данных между форматом Танкера и внутренним форматом приложения:

```typescript
// packages/i18n-sync/src/tanker/TankerClient.ts
async load({branch}: CommonOptions): Promise<Project | null> {
    // ...
    const tKeysets: TankerKeyset[] = (
        await this.api.get(`/project/${this.project}/branch/${escapedBranch}/keyset`)
    ).data.items;
    
    // ...
    
    return tdataProject.deserializeFromTanker(this.project, escapedBranch, filteredKeysets);
}
```

Этот паттерн позволяет:
- Преобразовывать данные из формата API Танкера во внутренний формат приложения
- Изолировать приложение от изменений в API Танкера
- Обеспечить совместимость между различными форматами данных

### Стратегия (Strategy)

Пакет i18n-sync использует паттерн "Стратегия" для поддержки различных форматов хранения переводов:

```typescript
// packages/i18n-sync/src/fs/Loader.ts
async saveAsCurrent(project: Project, dontRemoveKeysets?: boolean) {
    // ...
    for (const projectLoader of this.projectLoaders) {
        // ...
        await projectLoader.save({
            project: projectForLoader,
            dontRemoveKeysets,
        });
    }
}
```

Этот паттерн позволяет:
- Поддерживать различные форматы хранения переводов
- Добавлять новые форматы без изменения существующего кода
- Выбирать подходящий формат в зависимости от требований проекта

### Команда (Command)

В CLI-интерфейсе пакета используется паттерн "Команда" для реализации различных команд:

```typescript
// packages/i18n-sync/src/cli/commands/branch.ts
export default class BranchCommand extends Command {
    // ...
    async run(args: BranchArgs) {
        // ...
    }
}
```

Этот паттерн позволяет:
- Инкапсулировать запрос в виде объекта
- Параметризовать клиентов с различными запросами
- Ставить запросы в очередь или протоколировать их
- Поддерживать отмену операций

### Наблюдатель (Observer)

В системе логирования используется паттерн "Наблюдатель" для уведомления о различных событиях:

```typescript
// packages/i18n-sync/src/logger/index.ts
const logger = log.getLogger('i18n-sync');
```

Этот паттерн позволяет:
- Уведомлять заинтересованные объекты об изменениях
- Добавлять новых наблюдателей без изменения существующего кода
- Обеспечивать слабую связь между объектами

## Паттерны в пакете i18n-cli

### Посетитель (Visitor)

Пакет i18n-cli использует паттерн "Посетитель" для обхода и анализа AST (абстрактного синтаксического дерева) JavaScript/TypeScript кода:

```typescript
// packages/i18n-cli/src/parsing/createSourceVisitors.ts
export const createSourceVisitors = ({
    onCallFound,
    onJsxCallFound,
    onImportFound,
    additionalFunctions,
    additionalComponents,
}: CreateSourceVisitorArgs): ESLintUtils.RuleListener => {
    // ...
    return {
        ImportDeclaration: (node) => {
            // Обработка импортов
        },
        CallExpression: (node) => {
            // Обработка вызовов функций
        },
        JSXOpeningElement: (node) => {
            // Обработка JSX элементов
        },
    };
};
```

Этот паттерн позволяет:
- Разделить алгоритм обхода AST от операций, выполняемых над узлами
- Добавлять новые операции без изменения структуры AST
- Централизовать логику обхода AST

### Фабричный метод (Factory Method)

В CLI командах используется паттерн "Фабричный метод" для создания команд:

```typescript
// packages/i18n-cli/src/cli/commands/create-keys.ts
export const createKeys: Command<Commands.CreateKeys, Options> = createCommand(
    ({projectConfig}) => ({
        command: `${Commands.CreateKeys} <path>`,
        description: `...`,
        options(yargs) {
            // Настройка опций команды
        },
        action(args) {
            // Реализация действия команды
            return runCreateKeys(args, projectConfig);
        },
    }),
);
```

Этот паттерн позволяет:
- Создавать специализированные команды на основе конфигурации
- Инкапсулировать логику создания команд
- Обеспечивать гибкость при создании различных реализаций

### Стратегия (Strategy)

В процессе обработки файлов используется паттерн "Стратегия" для выбора различных стратегий обработки:

```typescript
// packages/i18n-cli/src/cli/commands/find-unused.ts
const runFindUnused = async (argv: Options) => {
    return throughDirs(argv.path, argv.recursively, async (i18nDirent, getTsFiles) => {
        // Стратегия обработки файлов
        // ...
        if (hasUnusedKeys && argv.delete) {
            // Стратегия удаления неиспользуемых ключей
            // ...
        }
    });
};
```

Этот паттерн позволяет:
- Выбирать различные алгоритмы обработки в зависимости от конфигурации
- Изолировать логику обработки от её реализации
- Легко добавлять новые стратегии обработки

### Команда (Command)

Пакет i18n-cli использует паттерн "Команда" для реализации CLI команд:

```typescript
// packages/i18n-cli/src/cli/run.ts
const commands: Command<string>[] = [createKeys, findUnused];

commands.forEach((cmd) => {
    const {command, description, options, action} = cmd(ctx);
    
    args.command(
        command,
        description,
        (yargs) => {
            return options(yargs.usage(`${bin} ${command} [options]`));
        },
        async (args) => {
            try {
                await action(args);
            } catch (error) {
                // Обработка ошибок
            }
        },
    );
});
```

Этот паттерн позволяет:
- Инкапсулировать запрос в виде объекта
- Параметризовать клиентов с различными запросами
- Ставить запросы в очередь или протоколировать их
- Поддерживать отмену операций

## Паттерны в пакете i18n-babel-plugin

### Посетитель (Visitor)

Пакет i18n-babel-plugin использует паттерн "Посетитель" для обхода и трансформации AST (абстрактного синтаксического дерева) JavaScript/TypeScript кода:

```typescript
// packages/i18n-babel-plugin/src/translations-file.ts
export const createTranslationsFileVisitor = (
    options: TranslationsFileVisitorOptions = {},
): Visitor => {
    // ...
    return {
        ImportDeclaration(importPath) {
            if (mode === 'only-translations') {
                importPath.remove();
            }
        },
        
        ExportNamedDeclaration(exportPath) {
            // Обработка экспортов
        },
    };
};
```

Этот паттерн позволяет:
- Разделить алгоритм обхода AST от операций, выполняемых над узлами
- Добавлять новые операции без изменения структуры AST
- Централизовать логику обхода AST

### Стратегия (Strategy)

В плагине используется паттерн "Стратегия" для выбора различных режимов трансформации:

```typescript
// packages/i18n-babel-plugin/src/plugin.ts
const visitor = createTranslationsFileVisitor({
    mode: options.mode,
    typograf: options.typograf,
    compileMessageToAst: options.compileMessageToAst,
    fallbackLocales: options.fallbackLocales,
    allowedLocales: options.allowedLocales,
});
```

Этот паттерн позволяет:
- Выбирать различные алгоритмы трансформации в зависимости от конфигурации
- Изолировать логику трансформации от её реализации
- Легко добавлять новые стратегии трансформации

### Цепочка обязанностей (Chain of Responsibility)

В процессе трансформации сообщений используется паттерн "Цепочка обязанностей":

```typescript
// packages/i18n-babel-plugin/src/translations-file.ts
function transformMessageValue({
    path,
    locale,
    meta,
    options,
}: TransformMessageValueParams): string | null {
    let value: string | null = null;

    // Извлечение значения
    if (path.isStringLiteral()) {
        value = path.node.value;
    } else if (path.isTemplateLiteral()) {
        // ...
    } else if (path.isNullLiteral()) {
        value = null;
    }

    // Трансформация Markdown в HTML
    if (typeof value === 'string' && meta?.markdown) {
        value = transformMarkdownToHTML(value);
    }

    // Применение типографа
    if (options.typografConfig && !meta?.disableTypograf && typeof value === 'string') {
        value = typograf(value, locale, options.typografConfig);
    }

    return value;
}
```

Этот паттерн позволяет:
- Последовательно применять различные трансформации к сообщениям
- Добавлять новые трансформации без изменения существующего кода
- Условно применять трансформации в зависимости от метаданных

### Фабричный метод (Factory Method)

Для создания посетителей AST используется паттерн "Фабричный метод":

```typescript
// packages/i18n-babel-plugin/src/translations-file.ts
export const createTranslationsFileVisitor = (
    options: TranslationsFileVisitorOptions = {},
): Visitor => {
    // Настройка параметров
    const mode = options.mode || 'default';
    const allowedLocales = options.allowedLocales || [];
    let typografConfig: TypografConfig | undefined;
    
    // ...
    
    // Создание и возврат посетителя
    return {
        // Реализация посетителя
    };
};
```

Этот паттерн позволяет:
- Создавать специализированные посетители на основе конфигурации
- Инкапсулировать логику создания посетителей
- Обеспечивать гибкость при создании различных реализаций

## Паттерны в пакете eslint-plugin-i18n

### Посетитель (Visitor)

Пакет eslint-plugin-i18n активно использует паттерн "Посетитель" для обхода и анализа AST (абстрактного синтаксического дерева) JavaScript/TypeScript кода:

```typescript
// packages/eslint-plugin-i18n/rules/string-literal-keys/index.ts
const i18nCallVisitors = createSourceVisitors({
    additionalComponents,
    additionalFunctions,
    onCallFound({idNode}) {
        if (!idNode) return;

        if (idNode.type !== 'Literal') {
            context.report({
                messageId: 'stringLiteralOnly',
                node: idNode,
            });
        }
    },
    onJsxCallFound({idAttr}) {
        if (idAttr.value && idAttr.value.type !== 'Literal') {
            context.report({
                messageId: 'stringLiteralOnly',
                node: idAttr,
            });
        }
    },
});

return i18nCallVisitors;
```

Этот паттерн позволяет:
- Разделить алгоритм обхода AST от операций, выполняемых над узлами
- Добавлять новые операции без изменения структуры AST
- Централизовать логику обхода AST

### Фабричный метод (Factory Method)

В правиле auto-generate-translation-message-id используется паттерн "Фабричный метод" для создания обработчиков узлов AST:

```typescript
// packages/eslint-plugin-i18n/rules/auto-generate-translation-message-id/handlers/member-expression.ts
export const getMemberExpression = ({
    context,
    idName,
    memberExpressions,
    ...rest
}: GetMemberExpressionProps) => {
    const sourceCode = context.getSourceCode();

    return (node: MemberExpressionNode) => {
        // Реализация обработчика
    };
};
```

Этот паттерн позволяет:
- Создавать специализированные обработчики на основе конфигурации
- Инкапсулировать логику создания обработчиков
- Обеспечивать гибкость при создании различных реализаций

### Стратегия (Strategy)

В правиле detectIncorrectCalls используется паттерн "Стратегия" для проверки различных типов вызовов i18n функций:

```typescript
// packages/eslint-plugin-i18n/rules/detectIncorrectCalls.ts
// Стратегия проверки глобального вызова i18n
if (node.callee.name === globalI18nName) {
    // Проверка глобального вызова i18n
    // ...
    return;
}

// Стратегия проверки вызова i18n через переменную
if (isI18nIdentifier) {
    // Проверка вызова i18n через переменную
    // ...
} else if (node.callee.name.startsWith(variableI18nPrefix)) {
    // Проверка неизвестного вызова с префиксом i18n
    // ...
}
```

Этот паттерн позволяет:
- Выбирать различные алгоритмы проверки в зависимости от типа вызова
- Изолировать логику проверки от её реализации
- Легко добавлять новые стратегии проверки

### Компоновщик (Composite)

В правиле auto-generate-translation-message-id используется паттерн "Компоновщик" для построения идентификаторов из различных частей:

```typescript
// packages/eslint-plugin-i18n/rules/auto-generate-translation-message-id/utils/build-id.ts
export const buildId: BuildId = ({translationObjectKey, namespace, uuid}) => {
    const translationObjectKeyWithUuid = [translationObjectKey, uuid]
        .filter(Boolean)
        .join(TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR);
    return [namespace, translationObjectKeyWithUuid].filter(Boolean).join(ID_SEPARATOR);
};
```

Этот паттерн позволяет:
- Создавать сложные идентификаторы из простых частей
- Обеспечивать единообразное форматирование идентификаторов
- Гибко настраивать формат идентификаторов

## Архитектурные паттерны в основных пакетах

### Фабричный метод (Factory Method)

Пакеты i18n-core, i18n-react и i18n-node активно используют паттерн "Фабричный метод" для создания функций и объектов:

```typescript
// i18n-core/src/components/factoryCreateMessagesFunction.ts
export function factoryCreateMessagesFunction<TBase, AvailableLocale extends string>(
    config: Pick<
        ResolvedIntlConfigWithLocale<TBase, AvailableLocale>,
        | 'getLocale'
        | 'fallbackLocales'
        | 'disableUseLocaleLangAsFallback'
        | 'allowedLocales'
        | 'defaultFallback'
    >,
) {
    return function createMessages<K extends string>(
        msgs: Messages<AvailableLocale, K>,
    ): Record<K, MessageDescriptor> {
        // Реализация
    };
}
```

Этот паттерн позволяет:
- Создавать специализированные функции на основе конфигурации
- Инкапсулировать логику создания объектов
- Обеспечивать гибкость при создании различных реализаций

### Прокси (Proxy)

В i18n-core используется паттерн "Прокси" для динамического доступа к сообщениям:

```typescript
// i18n-core/src/components/factoryCreateMessagesFunction.ts
return new Proxy({} as Record<K, MessageDescriptor>, {
    get(_target, key) {
        const baseMsg = msgs[key as K];

        if (typeof baseMsg === 'undefined') {
            throw new Error(`Not found message for key ${String(key)}`);
        }

        return getMessageDescriptor({
            key,
            message: baseMsg,
            currentLocale: config.getLocale(),
        });
    },
});
```

Этот паттерн позволяет:
- Лениво вычислять значения только при обращении к ним
- Добавлять дополнительную логику при доступе к свойствам
- Оптимизировать производительность

### Мемоизация (Memoization)

Во всех пакетах активно используется паттерн "Мемоизация" для кэширования результатов вычислений:

```typescript
// i18n-node/src/components/createIntl.ts
const getLocaleInstance = memoize(
    (locale: AvailableLocale | string): IntlShapeWithLocale<AvailableLocale> => {
        // Создание экземпляра для локали
    }
);
```

Этот паттерн позволяет:
- Кэшировать результаты дорогостоящих вычислений
- Повышать производительность при повторных вызовах с теми же аргументами
- Экономить ресурсы

### Композиция (Composition)

В i18n-react используется паттерн "Композиция" для создания компонентов:

```typescript
// i18n-react/src/components/message.tsx
function FormattedMessage(props: FormattedMessageProps) {
    const textComponent = props.config.textComponent ?? React.Fragment;
    // ...
    if (typeof children === 'function') {
        return children(Array.isArray(nodes) ? nodes : [nodes]);
    }

    if (Component) {
        return <Component>{React.Children.toArray(nodes)}</Component>;
    }
    return <>{nodes}</>;
}
```

Этот паттерн позволяет:
- Создавать сложные компоненты из простых
- Обеспечивать гибкость в отображении контента
- Разделять ответственность между компонентами

### Стратегия (Strategy)

В системе фолбэков используется паттерн "Стратегия" для выбора подходящего перевода:

```typescript
// i18n-core/src/components/factoryCreateMessagesFunction.ts
if (!isMessageDefined(defaultMessage)) {
    // Стратегия выбора фолбэка
    const fallbackLocales = getFallbackLocalesList(currentLocale, config);
    const fallbackLocale = fallbackLocales.find((locale) =>
        isMessageDefined(messages?.[locale as AvailableLocale]),
    );
    if (fallbackLocale) {
        defaultMessage = messages?.[fallbackLocale as AvailableLocale];
    }
}

if (!isMessageDefined(defaultMessage)) {
    // Стратегия выбора значения по умолчанию
    if (config.defaultFallback === 'key') {
        defaultMessage = String(key);
    } else if (config.defaultFallback === 'empty-string') {
        defaultMessage = '';
    } else {
        throw new MissingTranslationError(
            {
                id: String(key),
            },
            config.getLocale(),
        );
    }
}
```

Этот паттерн позволяет:
- Выбирать различные алгоритмы поведения в зависимости от условий
- Изолировать логику выбора стратегии от её реализации
- Легко добавлять новые стратегии

---

2025-04-23 15:51:00 - Первоначальное создание файла.
2025-04-23 16:05:00 - Добавлена детальная информация о паттернах в пакетах i18n-core, i18n-react и i18n-node.