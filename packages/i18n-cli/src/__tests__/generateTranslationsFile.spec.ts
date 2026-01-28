import {generateTranslationsFileContent} from '../generateTranslationsFile';
import {loadProjectConfig} from '../config/loadProjectConfig';
import {parseTranslationsFile} from '../parseTranslationsFile';

jest.mock('../config/loadProjectConfig');

describe('generateTranslationsFileContent', () => {
    it('simple string translations', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/units/compute/pages/MainPage',
            messages: [
                {
                    message: {
                        ru: 'О нас',
                        en: 'About us',
                    },
                    meta: {
                        objectKey: 'pageTitle',
                    },
                },
                {
                    message: {
                        ru: 'Имя',
                        en: 'Name',
                    },
                    meta: {objectKey: 'name'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('null in translations', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/units/compute/pages/MainPage',
            messages: [
                {
                    message: {
                        'de-DE': null,
                        en: 'About us',
                        'en-IN': null,
                        ru: 'О нас',
                        'ru-KZ': null,
                    },
                    meta: {
                        objectKey: 'pageTitle',
                    },
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate TemplateLiteral for multiline ICU messages', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/units/compute/pages/MainPage',
            messages: [
                {
                    message: {
                        en: `this is {count, plural,
                            one{# dog}
                            other{# dogs}
                        }`,
                        ru: `{count, plural,
                            =0 {У нас нет офисов}
                            =1 {У нас всего один офис}
                            other {У нас # офисов}
                        }`,
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate content for server path', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
                pathMatchers: [/src\/server\/.+$/], // Default path matchers
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/server/controllers/payments/main.ts',
            messages: [
                {
                    message: {
                        en: `this is {count, plural,
                            one{# dog}
                            other{# dogs}
                        }`,
                        ru: `{count, plural,
                            =0 {У нас нет офисов}
                            =1 {У нас всего один офис}
                            other {У нас # офисов}
                        }`,
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate content with custom server path matchers', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/custom-server/shared/intl.ts',
                pathMatchers: [/src\/custom-server\/.+$/],
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/custom-server/components/tasks/task-controller.ts',
            messages: [
                {
                    message: {
                        en: `this is {count, plural,
                            one{# dog}
                            other{# dogs}
                        }`,
                        ru: `{count, plural,
                            =0 {У нас нет офисов}
                            =1 {У нас всего один офис}
                            other {У нас # офисов}
                        }`,
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate old plural format messages', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/units/compute/pages/MainPage',
            messages: [
                {
                    message: {
                        en: {
                            few: undefined,
                            many: undefined,
                            one: 'one',
                            other: 'other',
                            two: undefined,
                            zero: 'zero',
                        },
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate message meta', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const messages = [
            {
                message: {
                    en: 'About us',
                    ru: 'О нас',
                    meta: {
                        id: 'keyset-test.pageTitle.i984ryg24',
                        description: 'compute page title',
                        markdown: true,
                    },
                },
                meta: {
                    objectKey: 'pageTitle',
                },
            },
        ];

        const generatedContent = generateTranslationsFileContent({
            outputPath: 'src/ui/units/compute/pages/MainPage',
            messages,
        });

        const result = await parseTranslationsFile({
            filePath: 'src/ui/units/compute/pages/MainPage/i18n.ts',
            content: generatedContent,
        });

        expect(result.messages).toEqual(messages);
    });

    it('generate language file in the same directory as the intl', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/shared/common.i18n.ts',
            messages: [
                {
                    message: {
                        en: `this is {count, plural,
                            one{# dog}
                            other{# dogs}
                        }`,
                        ru: `{count, plural,
                            =0 {У нас нет офисов}
                            =1 {У нас всего один офис}
                            other {У нас # офисов}
                        }`,
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate meta as last element property in object expression', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/shared/common.i18n.ts',
            messages: [
                {
                    message: {
                        meta: {
                            id: 'test-id',
                            description: 'proverka',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any,
                        en: `this is {count, plural,
                            one{# dog}
                            other{# dogs}
                        }`,
                        ru: `{count, plural,
                            =0 {У нас нет офисов}
                            =1 {У нас всего один офис}
                            other {У нас # офисов}
                        }`,
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate translations for all locales', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en', 'ru-kz'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/shared/common.i18n.ts',
            messages: [
                {
                    message: {
                        meta: {
                            id: 'test-id',
                            description: 'proverka',
                            markdown: true,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any,
                        en: 'proverka',
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('sort translation keys alphabetically', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en', 'ru-kz'],
            clientIntlModule: {
                path: './i18n.ts',
                alias: './i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/shared/common.i18n.ts',
            messages: [
                {
                    message: {
                        en: 'banana',
                    },
                    meta: {objectKey: 'banana'},
                },
                {
                    message: {
                        en: 'apple',
                    },
                    meta: {objectKey: 'apple'},
                },
                {
                    message: {
                        en: 'cherry',
                    },
                    meta: {objectKey: 'cherry'},
                },
                {
                    message: {
                        en: 'cherry',
                    },
                    meta: {objectKey: 'русский ключ'},
                },
                {
                    message: {
                        en: 'cherry',
                    },
                    meta: {objectKey: 'абвгд'},
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate with aliases in destructuring', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/ui/units/compute/pages/MainPage',
            exportAliases: {
                t: 'commonT',
                Message: 'CommonMessage',
            },
            messages: [
                {
                    message: {
                        ru: 'О нас',
                        en: 'About us',
                    },
                    meta: {
                        objectKey: 'pageTitle',
                    },
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });

    it('generate standalone declareMessages', async () => {
        jest.mocked(loadProjectConfig).mockReturnValue({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {
                path: 'src/ui/shared/i18n.ts',
                alias: '@shared/i18n',
            },
            serverIntlModule: {
                path: 'src/server/utils/i18n.ts',
            },
        });

        const result = generateTranslationsFileContent({
            outputPath: 'src/shared/messages/greeting.i18n.ts',
            declarationType: 'declareMessages',
            exportAliases: {
                default: 'greetingMessages',
            },
            messages: [
                {
                    message: {
                        ru: 'Привет',
                        en: 'Hello',
                    },
                    meta: {
                        objectKey: 'hello',
                    },
                },
                {
                    message: {
                        ru: 'До свидания',
                        en: 'Goodbye',
                        meta: {
                            id: 'greeting.goodbye',
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any,
                    meta: {
                        objectKey: 'goodbye',
                    },
                },
            ],
        });

        expect(result).toMatchSnapshot();
    });
});
