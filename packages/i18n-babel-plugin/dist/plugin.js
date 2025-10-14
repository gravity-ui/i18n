"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nPlugin = void 0;
const node_path_1 = require("node:path");
const helper_plugin_utils_1 = require("@babel/helper-plugin-utils");
const translations_file_1 = require("./translations-file");
function isTranslationsFile(filePath) {
    return filePath.endsWith('i18n.ts');
}
// @ts-expect-error declare написан так, что не получается валидно расширить тип PluginObj
exports.i18nPlugin = (0, helper_plugin_utils_1.declare)((api, options) => {
    api.assertVersion(7);
    return {
        name: 'i18n-babel-plugin',
        pre() {
            this.root = (0, node_path_1.resolve)(this.cwd, options.root ?? 'src');
        },
        visitor: {
            Program(path, state) {
                const fileName = state.filename ?? '';
                if (fileName.indexOf(state.root) !== 0) {
                    return;
                }
                if (isTranslationsFile(fileName)) {
                    const visitor = (0, translations_file_1.createTranslationsFileVisitor)({
                        mode: options.mode,
                        typograf: options.typograf,
                        compileMessageToAst: options.compileMessageToAst,
                        fallbackLocales: options.fallbackLocales,
                        allowedLocales: options.allowedLocales,
                    });
                    path.traverse(visitor, state);
                }
            },
        },
    };
});
//# sourceMappingURL=plugin.js.map