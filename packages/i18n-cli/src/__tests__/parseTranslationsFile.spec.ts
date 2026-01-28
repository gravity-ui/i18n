import {parseTranslationsFile} from '../parseTranslationsFile';

describe('parseTranslationsFile', () => {
    it('simple string translations', async () => {
        const result = await parseTranslationsFile({
            filePath: 'i18n.ts',
            content: `
            import { intl } from "@shared/i18n";

            export const {t, Message} = intl.createMessages({
                pageTitle: {
                    ru: 'О нас',
                    en: 'About us',
                },
                name: {
                    ru: 'Имя',
                    en: 'Name',
                },
            });
        `,
        });

        expect(result).toEqual({
            filePath: 'i18n.ts',
            exportAliases: {},
            declarationType: 'createMessages',
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
    });

    it('null in translations', async () => {
        const result = await parseTranslationsFile({
            filePath: 'i18n.ts',
            content: `
            import { intl } from "@shared/i18n";

            export const {t, Message} = intl.createMessages({
                pageTitle: {
                    ru: 'О нас',
                    en: 'About us',
                    'ru-KZ': null,
                    'de-DE': null,
                    'en-IN': null,
                },
            });
        `,
        });

        expect(result).toEqual({
            filePath: 'i18n.ts',
            exportAliases: {},
            declarationType: 'createMessages',
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
    });

    it('parse TemplateLiteral in translation', async () => {
        const result = await parseTranslationsFile({
            filePath: 'i18n.ts',
            content: `
            import { intl } from "@shared/i18n";

            export const {t, Message} = intl.createMessages({
                countOffices: {
                    ru: \`{count, plural,
                        =0 {У нас нет офисов}
                        =1 {У нас всего один офис}
                        other {У нас # офисов}
                    }\`,
                    en: \`{count, plural,
                        =0 {We don't have offices}
                        =1 {We have only one office}
                        other {We have # offices}
                    }\`,
                }
            });
        `,
        });

        expect(result).toEqual({
            filePath: 'i18n.ts',
            exportAliases: {},
            declarationType: 'createMessages',
            messages: [
                {
                    message: {
                        en: `{count, plural,
                        =0 {We don't have offices}
                        =1 {We have only one office}
                        other {We have # offices}
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
    });

    it('disallow using expressions in TemplateLiteral', async () => {
        expect(async () => {
            await parseTranslationsFile({
                filePath: 'i18n.ts',
                content: `
                import { intl } from "@shared/i18n";

                export const {t, Message} = intl.createMessages({
                    countOffices: {
                        ru: \`{count, plural,
                            =0 {У нас нет офисов} \${someVariable}
                            =1 {У нас всего один офис}
                            other {У нас # офисов}
                        }\`,
                        en: \`{count, plural,
                            =0 {We don't have offices}
                            =1 {We have only one office}
                            other {We have # offices}
                        }\`,
                    }
                });
            `,
            });
        }).rejects.toThrow();
    });

    it('old plural format in translation', async () => {
        const result = await parseTranslationsFile({
            filePath: 'i18n.ts',
            content: `
            import { intl } from "@shared/i18n";

            export const {t, Message} = intl.createMessages({
                countOffices: {
                    // TODO Support object format for plurals
                    ru: {
                        zero: 'У нас нет офисов',
                        one: 'У нас всего один офис',
                        other: 'У нас {{count}} офисов'
                    },
                    en: {
                        one: 'One office',
                        other: 'We have {{count}} offices'
                    },
                    // TODO Can be converted to ICU in building stage
                    'ru-KZ': {
                        zero: 'У нас нет офисов',
                        one: 'У нас всего один офис',
                        other: 'У нас {{count}} офисов'
                    },
                    'de-DE': null,
                    'en-IN': null
                }
            });
        `,
        });

        expect(result).toEqual({
            filePath: 'i18n.ts',
            exportAliases: {},
            declarationType: 'createMessages',
            messages: [
                {
                    message: {
                        'de-DE': null,
                        en: {
                            few: undefined,
                            many: undefined,
                            two: undefined,
                            one: 'One office',
                            other: 'We have {{count}} offices',
                            zero: undefined,
                        },
                        'en-IN': null,
                        ru: {
                            few: undefined,
                            many: undefined,
                            two: undefined,
                            zero: 'У нас нет офисов',
                            one: 'У нас всего один офис',
                            other: 'У нас {{count}} офисов',
                        },
                        'ru-KZ': {
                            few: undefined,
                            many: undefined,
                            two: undefined,
                            zero: 'У нас нет офисов',
                            one: 'У нас всего один офис',
                            other: 'У нас {{count}} офисов',
                        },
                    },
                    meta: {objectKey: 'countOffices'},
                },
            ],
        });
    });

    it('parse message meta', async () => {
        const result = await parseTranslationsFile({
            filePath: 'i18n.ts',
            content: `
            import { intl } from "@shared/i18n";

            export const {t, Message} = intl.createMessages({
                pageTitle: {
                    ru: 'О нас',
                    en: 'About us',
                    meta: {
                        id: 'keyset-test.pageTitle.i984ryg24',
                        description: 'compute page title',
                        markdown: true,
                    }
                },
            });
        `,
        });

        expect(result).toEqual({
            filePath: 'i18n.ts',
            exportAliases: {},
            declarationType: 'createMessages',
            messages: [
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
            ],
        });
    });

    it('supports aliases in destructuring', async () => {
        const result = await parseTranslationsFile({
            filePath: 'i18n.ts',
            content: `
            import { intl } from "@shared/i18n";

            export const {t: commonT, Message: CommonMessage} = intl.createMessages({
                pageTitle: {
                    ru: 'О нас',
                    en: 'About us',
                    meta: {
                        id: 'keyset-test.pageTitle.i984ryg24',
                    }
                },
            });
        `,
        });

        expect(result).toEqual({
            filePath: 'i18n.ts',
            declarationType: 'createMessages',
            messages: [
                {
                    message: {
                        en: 'About us',
                        ru: 'О нас',
                        meta: {
                            id: 'keyset-test.pageTitle.i984ryg24',
                        },
                    },
                    meta: {
                        objectKey: 'pageTitle',
                    },
                },
            ],
            exportAliases: {
                t: 'commonT',
                Message: 'CommonMessage',
            },
        });
    });

    it('parses standalone declareMessages call', async () => {
        const result = await parseTranslationsFile({
            filePath: 'i18n.ts',
            content: `
            import { declareMessages } from "@gravity-ui/i18n-react";

            export const sharedMessages = declareMessages({
                greeting: {
                    ru: 'Добро пожаловать',
                    en: 'Welcome',
                },
                farewell: {
                    ru: 'До свидания',
                    en: 'Goodbye',
                },
            });
        `,
        });

        expect(result).toEqual({
            filePath: 'i18n.ts',
            exportAliases: {default: 'sharedMessages'},
            declarationType: 'declareMessages',
            messages: [
                {
                    message: {
                        ru: 'Добро пожаловать',
                        en: 'Welcome',
                    },
                    meta: {
                        objectKey: 'greeting',
                    },
                },
                {
                    message: {
                        ru: 'До свидания',
                        en: 'Goodbye',
                    },
                    meta: {
                        objectKey: 'farewell',
                    },
                },
            ],
        });
    });
});
