"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const i18n_cli_1 = require("@gravity-ui/i18n-cli");
const utils_1 = require("@typescript-eslint/utils");
const MESSAGE = 'Key in i18n call must be String Literal';
exports.rule = utils_1.ESLintUtils.RuleCreator.withoutDocs({
    meta: {
        type: 'problem',
        docs: {
            description: MESSAGE,
            url: '/docs/rules/string-literal-keys.md',
        },
        messages: { stringLiteralOnly: MESSAGE },
        schema: [
            {
                type: 'object',
                properties: {
                    i18nSpecifier: { type: 'array' },
                    jsxI18nSpecifier: { type: 'array' },
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
        const { additionalComponents, additionalFunctions } = context.options[0];
        const i18nCallVisitors = (0, i18n_cli_1.createSourceVisitors)({
            additionalComponents,
            additionalFunctions,
            onCallFound({ idNode }) {
                if (!idNode)
                    return;
                if (idNode.type !== 'Literal') {
                    context.report({
                        messageId: 'stringLiteralOnly',
                        node: idNode,
                    });
                }
            },
            onJsxCallFound({ idAttr }) {
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
//# sourceMappingURL=index.js.map