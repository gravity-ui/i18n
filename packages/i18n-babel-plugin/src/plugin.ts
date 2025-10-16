import {PluginObj} from '@babel/core';
import {resolve as pathResolve} from 'node:path';
import {declare} from '@babel/helper-plugin-utils';
import {PluginContext, PluginOptions} from './types';
import {createTranslationsFileVisitor} from './translations-file';

function isTranslationsFile(filePath: string) {
    return filePath.endsWith('i18n.ts');
}

// @ts-expect-error declare написан так, что не получается валидно расширить тип PluginObj
export const i18nPlugin = declare<PluginOptions, PluginObj<PluginContext>>((api, options) => {
    api.assertVersion(7);

    return {
        name: 'i18n-babel-plugin',

        pre() {
            this.root = pathResolve(this.cwd, options.root ?? 'src');
        },

        visitor: {
            Program(path, state) {
                const fileName = state.filename ?? '';

                if (fileName.indexOf(state.root) !== 0) {
                    return;
                }

                if (isTranslationsFile(fileName)) {
                    const visitor = createTranslationsFileVisitor({
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
