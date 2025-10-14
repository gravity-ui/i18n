import { Rule } from 'eslint';
import { Node } from 'estree';

const i18nMethodNames = ['t'];
const i18nComponentNames = ['Message'];

interface CreateSourceVisitorArgs {
    /** Полный путь до файла, код которого обрабатывается */
    filename: string;
    /** Найден import или require, не обязательно i18n */
    onAnyImportFound?: (node: Node) => void;
    /** Найден import или require i18n-файла, но не соответствующего имени обрабатываемого файла */
    onOtherImportFound?: (node: Node) => void;
    /** Найден import или require i18n-файла. Вызывается только если импортируется файл, соответсвующий по имени обрабатываемому  */
    onImportFound: (args: { keysetFilename: string; methods: string[]; node: Node }) => void;
    /**
     * Найден вызов i18n-метода с ключем, работает только после первого onImportFound, либо если
     * передать shouldAlwaysSearchKeys
     */
    onKeyFound: (args: { key: string; method: string; node: Node }) => void;
    /** Найден некорректный вызов i18n-метода */
    onBadExpressionFound?: (node: Node) => void;
    /** Вызывать onKeyFound независимо от того, был ли уже найден импорт i18n-файла */
    shouldAlwaysSearchKeys?: boolean;
    debug?: (message: string) => void;
}

export function createSourceVisitor({
    filename,
    debug,
    onAnyImportFound,
    onOtherImportFound,
    onImportFound,
    onBadExpressionFound,
    onKeyFound,
    shouldAlwaysSearchKeys = false,
}: CreateSourceVisitorArgs): Rule.NodeListener {
    let searchKeys = shouldAlwaysSearchKeys;

    function processImport(node: Node, sourceValue: string, getImportedNames: () => string[]) {
        onAnyImportFound?.(node);

        if (!/\.i18n(\.[tj]s)?$/.test(sourceValue)) {
            return;
        }

        const sourcePath = sourceValue.replace(/^(\.\/|@|~)/, '');

        const keysetFilename = filename.replace(/\.tsx?$/, '.i18n.ts');
        if (!keysetFilename.endsWith(sourcePath) && !keysetFilename.replace(/\.[tj]s$/, '').endsWith(sourcePath)) {
            // Импортируется чужой файл i18n. Скорее всего обрабатывается файл теста/стори
            debug?.(`Импорт ${sourcePath} не соответствует ${keysetFilename}, пропускаем`);
            onOtherImportFound?.(node);
            return;
        }

        const methods = getImportedNames().filter(name => i18nMethodNames.includes(name));

        onImportFound({ keysetFilename, node, methods });
        searchKeys = true;
    }

    return {
        ImportDeclaration(node) {
            processImport(node, String(node.source.value), () => node.specifiers.map(s => s.local.name));
        },
        CallExpression(node) {
            if (node.callee.type !== 'Identifier') return;

            if (i18nMethodNames.includes(node.callee.name)) {
                if (!searchKeys) return;

                const key = node.arguments[0];
                if (!key) return;

                if (key.type !== 'Literal' || !(typeof key.value === 'string')) {
                    onBadExpressionFound?.(key);
                    return;
                }

                onKeyFound({ key: key.value, method: node.callee.name, node });
            }
        },
        JSXOpeningElement(node) {

        }
    };
}
