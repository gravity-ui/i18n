import {createSourceVisitors} from '@gravity-ui/i18n-cli';
import {ESLintUtils} from '@typescript-eslint/utils';

const MESSAGE = 'Key in i18n call must be String Literal';

export const rule = ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: 'problem',
        docs: {
            description: MESSAGE,
            url: '/docs/rules/string-literal-keys.md',
        },
        messages: {stringLiteralOnly: MESSAGE},
        schema: [
            {
                type: 'object',
                properties: {
                    i18nSpecifier: {type: 'array'},
                    jsxI18nSpecifier: {type: 'array'},
                },
            },
        ],
    },
    defaultOptions: [
        {
            additionalFunctions: [],
            additionalComponents: [],
        },
    ],
    create(context) {
        const {additionalComponents, additionalFunctions} = context.options[0];

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
    },
});
