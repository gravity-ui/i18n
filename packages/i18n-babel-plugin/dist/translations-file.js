"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTranslationsFileVisitor = void 0;
const core_1 = require("@babel/core");
const i18n_types_1 = require("@gravity-ui/i18n-types");
const markdown_1 = require("./markdown");
const typograf_1 = require("./typograf");
const shared_1 = require("./shared");
const icu_messageformat_parser_1 = require("@formatjs/icu-messageformat-parser");
function parseStringValue(path) {
    if (path.isIdentifier()) {
        return path.node.name;
    }
    if (path.isStringLiteral() && typeof path.node.value === 'string') {
        return path.node.value;
    }
    throw path.buildCodeFrameError('StringLiteral or Identifier expected here');
}
function parseBooleanValue(path) {
    if (path.isBooleanLiteral()) {
        return path.node.value;
    }
    throw path.buildCodeFrameError('BooleanLiteral expected here');
}
function isCreateMessagesCall(node) {
    return (core_1.types.isMemberExpression(node) &&
        core_1.types.isIdentifier(node.property) &&
        node.property.name === 'createMessages');
}
function isMetaProperty(path) {
    if (!path.isObjectProperty()) {
        return false;
    }
    const key = path.get('key');
    return ((key.isIdentifier() && key.node.name === 'meta') ||
        (key.isStringLiteral() && key.node.value === 'meta'));
}
function getMetaFromMessage(messagesObjectExpression) {
    const metaPropPath = messagesObjectExpression.get('properties').find(isMetaProperty);
    if (metaPropPath) {
        const value = metaPropPath.get('value');
        if (!value.isObjectExpression()) {
            throw value.buildCodeFrameError('ObjectExpression expected here');
        }
        const meta = {};
        value.get('properties').forEach((propPath) => {
            if (!propPath.isObjectProperty()) {
                return;
            }
            const key = parseStringValue(propPath.get('key'));
            if (key === 'id') {
                meta.id = parseStringValue(propPath.get('value'));
            }
            else if (key === 'description') {
                meta.description = parseStringValue(propPath.get('value'));
            }
            else if (key === 'markdown') {
                meta.markdown = parseBooleanValue(propPath.get('value'));
            }
            else if (key === 'disableTypograf') {
                meta.disableTypograf = parseBooleanValue(propPath.get('value'));
            }
        });
        return meta;
    }
    return undefined;
}
function transformMessageValue({ path, locale, meta, options, }) {
    let value = null;
    if (path.isStringLiteral()) {
        value = path.node.value;
    }
    else if (path.isTemplateLiteral()) {
        if (path.node.expressions.length || path.node.quasis.length > 1) {
            throw path.buildCodeFrameError('Forbidden to use expressions in TemplateLiteral');
        }
        value = path.node.quasis[0]?.value.raw || '';
        if (!meta?.markdown) {
            value = (0, shared_1.minifyICUMessage)(value);
        }
    }
    else if (path.isNullLiteral()) {
        value = null;
    }
    if (typeof value === 'string' && meta?.markdown) {
        value = (0, markdown_1.transformMarkdownToHTML)(value);
    }
    if (options.typografConfig && !meta?.disableTypograf && typeof value === 'string') {
        value = (0, typograf_1.typograf)(value, locale, options.typografConfig);
    }
    return value;
}
function optimizeMessage(path, options) {
    const { mode, allowedLocales, fallbackLocales } = options;
    const value = path.get('value');
    if (!value.isObjectExpression()) {
        throw value.buildCodeFrameError('ObjectExpression expected here');
    }
    const meta = getMetaFromMessage(value);
    const properties = value.get('properties');
    const localeValues = {};
    const getMessageReplacement = (path, locale) => {
        return transformMessageValue({
            path,
            meta,
            locale,
            options,
        });
    };
    properties.forEach((propPath) => {
        if (!propPath.isObjectProperty()) {
            return;
        }
        const propValue = propPath.get('value');
        const locale = parseStringValue(propPath.get('key'));
        if (isMetaProperty(propPath)) {
            return;
        }
        if (propValue.isObjectExpression()) {
            const pluralValue = {};
            propValue.get('properties').forEach((pluralPropPath) => {
                if (!pluralPropPath.isObjectProperty()) {
                    return;
                }
                const pluralForm = parseStringValue(pluralPropPath.get('key'));
                const pluralFormValue = pluralPropPath.get('value');
                if (!i18n_types_1.pluralForms.includes(pluralForm)) {
                    throw pluralPropPath.buildCodeFrameError(`Incorrect plural form. Supported plural forms: ${i18n_types_1.pluralForms.join(',')}`);
                }
                pluralValue[pluralForm] =
                    getMessageReplacement(pluralFormValue, locale) || '';
            });
            localeValues[locale] = (0, i18n_types_1.convertLegacyPluralToICU)(pluralValue);
            return;
        }
        localeValues[locale] = getMessageReplacement(propValue, locale);
    });
    if (mode === 'only-translations') {
        for (const locale of allowedLocales || []) {
            if (locale === i18n_types_1.TECH_LOCALE) {
                localeValues[locale] = meta?.id || 'Without ID';
                continue;
            }
            let localeValue = localeValues[locale];
            if (typeof localeValue !== 'string' && fallbackLocales) {
                let fallbackLocalesList = fallbackLocales[locale] || [];
                if (typeof fallbackLocalesList === 'string') {
                    fallbackLocalesList = [fallbackLocalesList];
                }
                for (const fallbackLocale of fallbackLocalesList) {
                    const fallbackLocaleValue = localeValues[fallbackLocale];
                    if (typeof fallbackLocaleValue === 'string') {
                        localeValue = fallbackLocaleValue;
                        break;
                    }
                }
            }
            localeValues[locale] = localeValue ?? null;
        }
    }
    const newProperties = Object.entries(localeValues).map(([locale, translation]) => {
        if (options.compileMessageToAst && typeof translation === 'string') {
            const preparedTranslation = meta?.markdown
                ? (0, shared_1.escapeHtmlTags)(translation)
                : (0, shared_1.minifyICUMessage)(translation);
            const compiledTranslation = (0, icu_messageformat_parser_1.parse)(preparedTranslation, {
                // markdown должнен использоваться с ignoreTag: true
                ignoreTag: Boolean(meta?.markdown),
            });
            return core_1.types.objectProperty(core_1.types.stringLiteral(locale), core_1.types.valueToNode(compiledTranslation));
        }
        return core_1.types.objectProperty(core_1.types.stringLiteral(locale), typeof translation === 'string'
            ? core_1.types.stringLiteral(translation)
            : core_1.types.nullLiteral());
    });
    value.replaceWith(core_1.types.objectExpression(newProperties));
}
function optimizeCreateMessages(path, options) {
    const args = path.get('arguments');
    if (args.length > 0 && args[0]?.isObjectExpression()) {
        const messagesObjectExpression = args[0];
        const properties = messagesObjectExpression.get('properties');
        properties.forEach((propPath) => {
            if (!propPath.isObjectProperty()) {
                return;
            }
            optimizeMessage(propPath, options);
        });
    }
}
const createTranslationsFileVisitor = (options = {}) => {
    const mode = options.mode || 'default';
    const allowedLocales = options.allowedLocales || [];
    let typografConfig;
    if (typeof options.typograf === 'object') {
        typografConfig = options.typograf;
    }
    else if (typeof options.typograf === 'undefined' || options.typograf) {
        typografConfig = typograf_1.DEFAULT_TYPOGRAF_CONFIG;
    }
    if (mode === 'only-translations' && !allowedLocales.length) {
        throw new Error('allowedLocales is required in only-translations mode');
    }
    return {
        ImportDeclaration(importPath) {
            if (mode === 'only-translations') {
                importPath.remove();
            }
        },
        ExportNamedDeclaration(exportPath) {
            const declaration = exportPath.get('declaration');
            if (declaration.isVariableDeclaration()) {
                const varDecl = declaration.get('declarations')[0];
                if (!varDecl) {
                    return;
                }
                const init = varDecl.get('init');
                if (init.isCallExpression() && isCreateMessagesCall(init.node.callee)) {
                    const messagesObjectExpression = init.get('arguments')[0];
                    if (!messagesObjectExpression ||
                        !messagesObjectExpression.isObjectExpression()) {
                        throw init.buildCodeFrameError('ObjectExpression expected here');
                    }
                    optimizeCreateMessages(init, {
                        typografConfig,
                        compileMessageToAst: options.compileMessageToAst,
                        fallbackLocales: options.fallbackLocales,
                        allowedLocales,
                        mode,
                    });
                    if (options.mode === 'only-translations') {
                        const messagesObject = messagesObjectExpression.node;
                        const exportDefault = core_1.types.exportDefaultDeclaration(messagesObject);
                        exportPath.replaceWith(exportDefault);
                        return;
                    }
                }
            }
        },
    };
};
exports.createTranslationsFileVisitor = createTranslationsFileVisitor;
//# sourceMappingURL=translations-file.js.map