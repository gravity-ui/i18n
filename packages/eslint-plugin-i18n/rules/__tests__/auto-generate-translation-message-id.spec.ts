import {RuleTester} from 'eslint';
import shortUuid, {SUUID} from 'short-uuid';

import {rule} from '../auto-generate-translation-message-id';
import {TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR} from '../auto-generate-translation-message-id/constants';
import {RuleOptions} from '../auto-generate-translation-message-id/types';

const uuidMocked: SUUID = '5251Zqy4Tirk6yhwzvmkpy' as SUUID;
const UUID = uuidMocked.slice(0, 5);

jest.mock('short-uuid');

jest.mocked(shortUuid.generate).mockReturnValue(uuidMocked);

const ruleTester = new RuleTester({});

const filename = 'src/ui/units/audit-trails/components/Trail/Trail.tsx';

const runTests = (
    validCases: RuleTester.ValidTestCase[],
    invalidCases: RuleTester.InvalidTestCase[],
) => {
    ruleTester.run('', rule, {
        valid: validCases,
        invalid: invalidCases,
    });
};

describe('Rule auto-generate-translation-message-id', () => {
    describe('without namespace', () => {
        const options: Partial<RuleOptions>[] = [
            {
                memberExpressions: [{member: 'intl', property: 'createMessages'}],
            },
        ];

        describe('should not change existing id', () => {
            const validCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            en: 'Create',
                            meta: {
                                id: 'id-value',
                            }
                        }
                    })`,
                    options,
                },
            ];

            runTests(validCases, []);
        });

        describe(`should add meta with generated uuid if id does't exist`, () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            en: 'Create',
                        }
                    })`,
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},
                            en: 'Create',
                        }
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe(`should add meta with generated uuid if id does't exist with plural translation`, () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            en: {zero: 'zero'},
                        }
                    })`,
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},
                            en: {zero: 'zero'},
                        }
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe(`should add generated uuid if id does't exist`, () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            meta: {description: "text"},
                            en: 'Create',
                        }
                    })`,
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {
                            meta: {id:'create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}',description: "text"},
                            en: 'Create',
                        }
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe(`should add generated uuid if parameter - empty object`, () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {}
                    })`,
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},}
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe(`should not add generated uuid if maxValidLength is less than uuid`, () => {
            const testOptions: Partial<RuleOptions>[] = [{...options[0], maxValidLength: 1}];
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            en: 'Create',
                        }
                    })`,
                    options: testOptions,
                    errors: [
                        {
                            message:
                                "Can't generate message id because it exceeds the maximum valid length of 1 characters. Please change the regular expression in namespaceMatchers used for id generation, update the generateId function",
                        },
                    ],
                    output: `intl.createMessages({
                        create: {
                            en: 'Create',
                        }
                    })`,
                },
            ];

            runTests([], invalidCases);
        });
    });

    describe('with namespace', () => {
        const options: Partial<RuleOptions>[] = [
            {
                memberExpressions: [{member: 'intl', property: 'createMessages'}],
                namespaceMatchers: [
                    // src/ui/units/*/components/*
                    /src\/ui\/units\/([^/]+)\/components\/([^/]+)/,
                    /src\/ui\/units\/([^/]+)\/pages\/([^/]+)/,
                ],
                invalidCharsReplacement: '_',
            },
        ];

        describe('should not change not valid namespace', () => {
            const validCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            meta: {id: 'dc62395d-1637-4aee-9ac6-3a6d7a5983b2'},
                            en: 'Create',
                        }
                    })`,
                    filename,
                    options,
                },
            ];

            runTests(validCases, []);
        });

        describe('should add id with namespace', () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            en: 'Create',
                        }
                    })`,
                    filename,
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'audit-trails.Trail.create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},
                            en: 'Create',
                        }
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe('should add id with namespace of kebab-case key', () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        'kebab-case': {
                            en: 'kebab-case',
                        }
                    })`,
                    filename,
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        'kebab-case': {meta:{id:'audit-trails.Trail.kebab-case${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},
                            en: 'kebab-case',
                        }
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe('should add id without namespace if it is not matched', () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {}
                    })`,
                    filename: 'path/with/not/match',
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},}
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe('should use first match for generation namespace', () => {
            const testOptions: Partial<RuleOptions>[] = [
                {
                    ...options[0],
                    namespaceMatchers: [
                        // src/ui/units/*/components/*
                        /src\/ui\/units\/([^/]+)\/components\/([^/]+)/,
                        // src/ui/units/*/components/test/*
                        /src\/ui\/units\/([^/]+)\/components\/test\/([^/]+)/,
                    ],
                },
            ];

            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {}
                    })`,
                    filename,
                    options: testOptions,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'audit-trails.Trail.create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},}
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe(`should add generated id with replaced invalid chars based on invalidCharsPattern with invalidCharsReplacement`, () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {}
                    })`,
                    filename: 'src/ui/units/audit-trails/pages/[pageId]/TrailPage.tsx',
                    options,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'audit-trails._pageId_.create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},}
                    })`,
                },
            ];

            runTests([], invalidCases);
        });

        describe(`should add generated id with replaced invalid chars based on invalidCharsPattern using invalidCharsReplacer function`, () => {
            const testOptions: Partial<RuleOptions>[] = [
                {
                    ...options[0],
                    invalidCharsReplacer: () => '-',
                },
            ];

            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {}
                    })`,
                    filename: 'src/ui/units/audit-trails/pages/[pageId]/TrailPage.tsx',
                    options: testOptions,
                    errors: [{message: 'Expression should have id property'}],
                    output: `intl.createMessages({
                        create: {meta:{id:'audit-trails.-pageId-.create${TRANSLATION_OBJECT_KEY_AND_UUID_SEPARATOR}${UUID}'},}
                    })`,
                },
            ];

            runTests([], invalidCases);
        });
    });

    describe('with generateId function', () => {
        const generatedIdMock = 'generated';
        const options: Partial<RuleOptions>[] = [
            {
                memberExpressions: [{member: 'intl', property: 'createMessages'}],
                generateId() {
                    return generatedIdMock;
                },
            },
        ];

        describe('should not change generated id', () => {
            const validCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            meta: {id: ${generatedIdMock}}
                        }
                    })`,
                    options,
                },
            ];

            runTests(validCases, []);
        });

        describe('should not change generated id event if it was changed', () => {
            const validCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {
                            meta: {id: 'custom-id'}
                        }
                    })`,
                    options,
                },
            ];

            runTests(validCases, []);
        });

        describe('should add generated id', () => {
            const invalidCases = [
                {
                    name: 'member expression',
                    code: `intl.createMessages({
                        create: {}
                    })`,
                    errors: [
                        {
                            message: `Expression should have id property`,
                        },
                    ],
                    output: `intl.createMessages({
                        create: {meta:{id:'${generatedIdMock}'},}
                    })`,
                    filename,
                    options,
                },
            ];

            runTests([], invalidCases);
        });
    });
});
