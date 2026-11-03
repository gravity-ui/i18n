import {
    type MessageWithPlacementMeta,
    generateTranslationsFileContent,
    getMessagesFromObjectExpression,
} from '@gravity-ui/i18n-cli';
import {Linter, type Rule, RuleTester} from 'eslint';
import type {Node, ObjectExpression} from 'estree';

import {rule} from '../normalize-messages';

const ruleTester = new RuleTester({languageOptions: {ecmaVersion: 2022, sourceType: 'module'}});

const I18N_FILE = '/project/src/widget/i18n.ts';
const OTHER_FILE = '/project/src/widget/Component.tsx';

const options = [{allowedLocales: ['ru', 'en']}];

ruleTester.run('normalize-messages', rule, {
    valid: [
        {
            name: 'already normalized',
            code: `
intl.createMessages({
    a: {
        ru: 'а',
        en: null,
        meta: {
            id: 'k.a',
            description: 'desc',
        },
    },
    b: {
        ru: {
            one: 'один',
            other: 'много',
        },
        en: '',
        meta: {
            id: 'k.b',
        },
    },
});
`,
            filename: I18N_FILE,
            options,
        },
        {
            name: 'quote style and key notation are not checked',
            code: `
intl.createMessages({
    "a": {
        "ru": "а",
        'en': 'a',
        "meta": {"id": "k.a"},
    },
});
`,
            filename: I18N_FILE,
            options,
        },
        {
            name: 'files not matching filenameMatcher are ignored',
            code: `intl.createMessages({b: {en: 'b'}, a: {en: 'a'}});`,
            filename: OTHER_FILE,
            options,
        },
        {
            name: 'other calls are ignored',
            code: `foo({b: {en: 'b'}, a: {en: 'a'}});`,
            filename: I18N_FILE,
            options,
        },
    ],
    invalid: [
        {
            name: 'sorts keys, orders locales, fills missing and drops unknown locales',
            code: `
export const {t} = intl.createMessages({
    b: {
        en: 'b',
        kk: 'b',
        meta: {id: 'k.b'},
    },
    a: {
        meta: {id: 'k.a'},
        en: 'a',
        ru: 'а',
    },
});
`,
            output: `
export const {t} = intl.createMessages({
    a: {
        ru: 'а',
        en: 'a',
        meta: {id: 'k.a'},
    },
    b: {
        ru: null,
        en: 'b',
        meta: {id: 'k.b'},
    },
});
`,
            filename: I18N_FILE,
            options,
            errors: [{messageId: 'notNormalized'}],
        },
        {
            name: 'normalizes meta, plural forms and values',
            code: `
intl.createMessages({
    plural: {
        ru: {other: 'много', one: 'один'},
        en: {one: '', other: ''},
        meta: {id: 'k.plural', description: '', unknown: 'x'},
    },
    undef: {
        ru: undefined,
        en: "a",
        meta: {markdown: true, id: 'k.undef'},
    },
});
`,
            output: `
intl.createMessages({
    plural: {
        ru: {
            one: 'один',
            other: 'много',
        },
        en: '',
        meta: {
            id: 'k.plural',
        },
    },
    undef: {
        ru: null,
        en: "a",
        meta: {
            id: 'k.undef',
            markdown: true,
        },
    },
});
`,
            filename: I18N_FILE,
            options,
            errors: [{messageId: 'notNormalized'}],
        },
        {
            name: 'uses allowedLocales order and keeps double quotes',
            code: `
intl.createMessages({
    a: {
        ru: "а",
        meta: {id: "k.a"},
    },
});
`,
            output: `
intl.createMessages({
    a: {
        en: null,
        kk: null,
        ru: "а",
        meta: {id: "k.a"},
    },
});
`,
            filename: I18N_FILE,
            options: [{allowedLocales: ['en', 'kk', 'ru']}],
            errors: [{messageId: 'notNormalized'}],
        },
        {
            name: 'reports without fix when the object contains comments',
            code: `
intl.createMessages({
    // comment
    b: {ru: 'b', en: 'b', meta: {id: 'k.b'}},
    a: {ru: 'a', en: 'a', meta: {id: 'k.a'}},
});
`,
            output: null,
            filename: I18N_FILE,
            options,
            errors: [{messageId: 'notNormalized'}],
        },
        {
            name: 'reports messages that the i18n-cli parser cannot handle',
            code: `
const other = {};
intl.createMessages({
    ...other,
    a: {ru: 'a', en: 'a'},
});
`,
            output: null,
            filename: I18N_FILE,
            options,
            errors: [{messageId: 'cannotNormalize'}],
        },
    ],
});

/**
 * Oracle: the autofix must produce the same messages object as the i18n-cli generator, i.e.
 * i18n-cli parse → collapse empty plurals → i18n-cli generateTranslationsFileContent.
 */
describe('normalize-messages matches i18n-cli generator output', () => {
    const LINTER_LANGUAGE_OPTIONS = {ecmaVersion: 2022, sourceType: 'module'} as const;

    function captureMessagesObject(code: string): ObjectExpression {
        let captured: ObjectExpression | undefined;
        const capture: Rule.RuleModule = {
            create: () => ({
                CallExpression(node) {
                    const arg = node.arguments[0];
                    if (arg?.type === 'ObjectExpression') {
                        captured = arg;
                    }
                },
            }),
        };

        const messages = new Linter().verify(code, {
            files: ['**/*'],
            languageOptions: LINTER_LANGUAGE_OPTIONS,
            plugins: {test: {rules: {capture}}},
            rules: {'test/capture': 'error'},
        });

        if (!captured) {
            throw new Error(`messages object not found: ${JSON.stringify(messages)}`);
        }

        return captured;
    }

    // Null values are dropped (the generator restores allowed locales as null),
    // plurals with all forms empty become ''.
    function prepareMessages(messages: MessageWithPlacementMeta[]): MessageWithPlacementMeta[] {
        return messages.map(({message, meta}) => {
            const result: Record<string, unknown> = {meta: message.meta};

            for (const [locale, value] of Object.entries(message)) {
                if (locale === 'meta' || value === null) {
                    continue;
                }

                result[locale] =
                    typeof value === 'object' && Object.values(value).every((form) => !form)
                        ? ''
                        : value;
            }

            return {message: result as MessageWithPlacementMeta['message'], meta};
        });
    }

    function generateWithI18nCli(code: string): string {
        const messages = getMessagesFromObjectExpression(
            captureMessagesObject(code) as unknown as Parameters<
                typeof getMessagesFromObjectExpression
            >[0],
        );

        return generateTranslationsFileContent({
            outputPath: I18N_FILE,
            messages: prepareMessages(messages),
        });
    }

    function stripLocations(node: Node): unknown {
        return JSON.parse(
            JSON.stringify(node, function (this: {type?: string}, key, value) {
                // Literal raw differs in quote style only; TemplateElement raw must be kept
                if (key === 'raw' && this.type === 'Literal') {
                    return undefined;
                }

                return ['start', 'end', 'loc', 'range', 'parent'].includes(key) ? undefined : value;
            }),
        );
    }

    function toComparable(node: ObjectExpression): unknown {
        // Key notation (`ru` vs `'ru'`) is up to the formatter
        const normalizeKeys = (value: unknown): unknown => {
            if (Array.isArray(value)) {
                return value.map(normalizeKeys);
            }
            if (value && typeof value === 'object') {
                const obj = value as Record<string, unknown>;
                if (obj.type === 'Property') {
                    const key = obj.key as {type: string; name?: string; value?: unknown};
                    return {
                        key: key.type === 'Identifier' ? key.name : String(key.value),
                        value: normalizeKeys(obj.value),
                    };
                }
                return Object.fromEntries(
                    Object.entries(obj).map(([k, v]) => [k, normalizeKeys(v)]),
                );
            }
            return value;
        };

        return normalizeKeys(stripLocations(node));
    }

    const cases: Record<string, string> = {
        'unsorted keys with case-sensitive order': `
intl.createMessages({
    b: {ru: 'b', en: 'b', meta: {id: 'k.b'}},
    B: {ru: 'B', en: 'B', meta: {id: 'k.B'}},
    a: {ru: 'a', en: 'a', meta: {id: 'k.a'}},
    'a-b': {ru: 'ab', en: 'ab', meta: {id: 'k.a-b'}},
    A: {ru: 'A', en: 'A', meta: {id: 'k.A'}},
});
`,
        'locales and meta': `
intl.createMessages({
    a: {
        meta: {disableTypograf: true, markdown: false, description: 'd', id: 'k.a', extra: 'x'},
        kk: 'kk',
        en: undefined,
    },
    b: {en: 'b', meta: {id: 'k.b', description: ''}},
});
`,
        plurals: `
intl.createMessages({
    a: {
        ru: {other: 'много', few: 'несколько', one: 'один', many: null},
        en: {one: '', other: ''},
        meta: {id: 'k.a'},
    },
    b: {ru: '', en: {other: 'many', one: 'one'}, meta: {id: 'k.b'}},
});
`,
        'multiline ICU': `
intl.createMessages({
    a: {
        ru: '{count, plural,\\n  one {# день}\\n  other {# дней}\\n}',
        en: \`
{count, plural, one {# day} other {# days}}\`,
        meta: {id: 'k.a'},
    },
    b: {
        ru: '{count, plural,\\n  one {# день}\\n  other {# дней}\\n}',
        en: null,
        meta: {id: 'k.b', markdown: true},
    },
});
`,
    };

    it.each(Object.entries(cases))('%s', (_name, code) => {
        const linter = new Linter({cwd: '/project'});
        const {output, messages} = linter.verifyAndFix(
            code,
            {
                files: ['**/*.ts'],
                languageOptions: LINTER_LANGUAGE_OPTIONS,
                plugins: {i18n: {rules: {'normalize-messages': rule}}},
                rules: {'i18n/normalize-messages': ['error', {allowedLocales: ['ru', 'en']}]},
            },
            {filename: I18N_FILE},
        );

        expect(messages).toEqual([]);
        expect(output).not.toBe(code);
        expect(toComparable(captureMessagesObject(output))).toEqual(
            toComparable(captureMessagesObject(generateWithI18nCli(code))),
        );
    });
});
