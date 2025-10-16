import path from 'path';

import type {Rule} from 'eslint';

import {I18N_FILE_NAME} from './constants';

type RuleOptions = {
    i18nFileName?: string;
    exclusions?: {
        aliases?: string[];
        filePathsMatchers?: RegExp[];
    };
};

export const rule: Rule.RuleModule = {
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
                    i18nFileName: {type: 'string'},
                    exclusionsAliases: {type: 'object'},
                },
            },
        ],
    },

    create(context) {
        return {
            ImportDeclaration(node) {
                const {
                    i18nFileName = I18N_FILE_NAME,
                    exclusions = {aliases: [], filePathsMatchers: []},
                }: RuleOptions = context.options[0] || {};

                const importPath = node.source.value;

                if (!importPath || typeof importPath !== 'string') {
                    return;
                }

                const isI18nFile =
                    importPath.endsWith(`/${i18nFileName}.ts`) ||
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
                        filePath = path.resolve(path.dirname(filename), importPath);
                    }

                    const isMatch = exclusions.filePathsMatchers.some((matcher) =>
                        filePath.match(matcher),
                    );

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
