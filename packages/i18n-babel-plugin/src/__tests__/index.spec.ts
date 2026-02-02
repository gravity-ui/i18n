import path from 'path';

import * as babel from '@babel/core';

function resolve(...parts: string[]) {
    return path.resolve(__dirname, './__fixtures__/', ...parts);
}

function transform(fileName: string, mode?: string) {
    return babel.transformFileSync(resolve(fileName), {
        configFile: resolve(`.babelrc-${mode || 'normal'}`),
    })?.code;
}

function runTestWithSnap(fileName: string, mode?: string) {
    const result = transform(`${fileName}.ts`, mode);

    expect(result).toMatchSnapshot();
}

describe('transformations', () => {
    it('remove meta from messages', () => {
        runTestWithSnap('i18n');
    });

    it('global disable typograf', () => {
        runTestWithSnap('i18n', 'without-typograf');
    });

    it('disable typograf for one key', () => {
        runTestWithSnap('disabled-typograf-i18n');
    });

    it('markdown message', () => {
        runTestWithSnap('markdown-i18n');
    });

    it('only translations mode', () => {
        runTestWithSnap('i18n', 'only-translations');
    });

    it('only translations mode with fallbacks', () => {
        runTestWithSnap('i18n', 'only-translations-with-fallbacks');
    });

    it('compile messages to AST', () => {
        runTestWithSnap('i18n', 'compile-to-ast');
    });

    it('TECH target locale with ids', () => {
        runTestWithSnap('i18n', 'target-locale-tech');
    });

    describe('declareMessages', () => {
        it('remove meta from messages', () => {
            runTestWithSnap('declare-messages-i18n');
        });

        it('only translations mode', () => {
            runTestWithSnap('declare-messages-i18n', 'only-translations');
        });

        it('compile messages to AST', () => {
            runTestWithSnap('declare-messages-i18n', 'compile-to-ast');
        });
    });
});
