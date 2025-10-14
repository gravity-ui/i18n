"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const constants_1 = require("./constants");
exports.rule = {
    meta: {
        fixable: 'code',
        type: 'problem',
        docs: {
            description: 'Prevent importing i18n.ts files from other nesting levels',
            category: 'Best Practices',
            url: '/docs/rules/restrict-i18n-imports.md',
            recommended: false,
        },
        schema: [
            {
                type: 'object',
                properties: {
                    i18nFileName: { type: 'string' },
                    exclusionsAliases: { type: 'object' },
                },
            },
        ],
    },
    create(context) {
        return {
            ImportDeclaration(node) {
                const { i18nFileName = constants_1.I18N_FILE_NAME, exclusions = { aliases: [], filePathsMatchers: [] }, } = context.options[0] || {};
                const importPath = node.source.value;
                if (!importPath || typeof importPath !== 'string') {
                    return;
                }
                const isI18nFile = importPath.endsWith(`/${i18nFileName}.ts`) ||
                    importPath.endsWith(`/${i18nFileName}`);
                if (!isI18nFile) {
                    return;
                }
                if (importPath === `./${i18nFileName}` || importPath === `./${i18nFileName}.ts`) {
                    return;
                }
                if (exclusions.aliases?.includes(importPath)) {
                    return;
                }
                if (exclusions.filePathsMatchers) {
                    let filePath = importPath;
                    const filename = context.getFilename();
                    if (importPath.startsWith('.')) {
                        filePath = path_1.default.resolve(path_1.default.dirname(filename), importPath);
                    }
                    const isMatch = exclusions.filePathsMatchers.some((matcher) => filePath.match(matcher));
                    if (isMatch) {
                        return;
                    }
                }
                context.report({
                    node,
                    message: `${i18nFileName}.ts files can only be imported from the same directory.\nImport translations using "import {} from './${i18nFileName}" syntax.`,
                });
            },
        };
    },
};
//# sourceMappingURL=restrict-i18n-imports.js.map