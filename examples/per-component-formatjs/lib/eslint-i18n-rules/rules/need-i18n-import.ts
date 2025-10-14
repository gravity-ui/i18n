import { Rule } from 'eslint';
import { ImportDeclaration, Node } from 'estree';

export const needI18nImport: Rule.RuleModule = {
    meta: {
        type: 'problem',
        fixable: 'code',
    },
    create(context) {
        let isEsMudules = false;
        let hasOtherImport = false;
        let lastImport: Node | undefined = undefined;
        let importedI18nNames: string[] = [];
        let existedImport: ImportDeclaration | undefined = undefined;
        return {
            ...createSourceVisitor({
                filename: context.getFilename(),
                onAnyImportFound(node) {
                    if (node.type === 'ImportDeclaration') {
                        isEsMudules = true;
                        lastImport = node;
                    } else if (!isEsMudules) {
                        lastImport = node;
                    }
                },
                onOtherImportFound() {
                    hasOtherImport = true;
                },
                onImportFound({ node, methods }) {
                    importedI18nNames.push(...methods);
                    if (node.type === 'ImportDeclaration') {
                        existedImport = node;
                    }
                },
                shouldAlwaysSearchKeys: true,
                onKeyFound({ method: usedMethodName, node }) {
                    if (!hasOtherImport && !importedI18nNames.includes(usedMethodName)) {
                        context.report({
                            node,
                            message: 'Нет импорта метода i18n',
                            fix(fixer) {
                                if (lastImport && !isEsMudules) return null;

                                const methods: string[] = [...importedI18nNames, usedMethodName];

                                const source = existedImport
                                    ? existedImport.source.value
                                    : './' + context.getFilename().replace(/.*\/|\.tsx?$/g, '') + '.i18n';

                                const importText = `import { ${methods.join(', ')} } from '${source}';`;

                                if (existedImport) {
                                    return fixer.replaceText(existedImport, importText);
                                }
                                if (lastImport) {
                                    return fixer.insertTextAfter(lastImport, '\n' + importText);
                                }
                                return fixer.insertTextBeforeRange([0, 0], importText + '\n');
                            },
                        });
                    }
                },
            }),
        };
    },
};
