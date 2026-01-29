import {NodePath, Visitor, types} from '@babel/core';
import {TypografConfig} from './types';
import {convertLegacyPluralToICU, pluralForms, TECH_LOCALE} from '@gravity-ui/i18n-types';
import type {FallbackLocales, MessageMeta, PluralForm, PluralValue} from '@gravity-ui/i18n-types';
import {
    CallExpression,
    MemberExpression,
    Node,
    ObjectExpression,
    ObjectProperty,
} from '@babel/types';
import {transformMarkdownToHTML} from './markdown';
import {DEFAULT_TYPOGRAF_CONFIG, typograf} from './typograf';
import {minifyICUMessage, escapeHtmlTags} from './shared';
import {parse} from '@formatjs/icu-messageformat-parser';

type OptimizeMessageOptions = {
    mode: 'default' | 'only-translations';
    typografConfig?: TypografConfig;
    compileMessageToAst?: boolean;
    allowedLocales?: string[];
    fallbackLocales?: FallbackLocales<string>;
};

function parseStringValue(path: NodePath): string {
    if (path.isIdentifier()) {
        return path.node.name;
    }

    if (path.isStringLiteral() && typeof path.node.value === 'string') {
        return path.node.value;
    }

    throw path.buildCodeFrameError('StringLiteral or Identifier expected here');
}

function parseBooleanValue(path: NodePath): boolean {
    if (path.isBooleanLiteral()) {
        return path.node.value;
    }

    throw path.buildCodeFrameError('BooleanLiteral expected here');
}

function isCreateMessagesCall(node: Node): node is MemberExpression {
    return (
        types.isMemberExpression(node) &&
        types.isIdentifier(node.property) &&
        node.property.name === 'createMessages'
    );
}

function isDeclareMessagesCall(node: Node): node is types.Identifier {
    return types.isIdentifier(node) && node.name === 'declareMessages';
}

function isMetaProperty(path: NodePath): path is NodePath<ObjectProperty> {
    if (!path.isObjectProperty()) {
        return false;
    }

    const key = path.get('key');

    return (
        (key.isIdentifier() && key.node.name === 'meta') ||
        (key.isStringLiteral() && key.node.value === 'meta')
    );
}

function getMetaFromMessage(
    messagesObjectExpression: NodePath<ObjectExpression>,
): MessageMeta | undefined {
    const metaPropPath = messagesObjectExpression.get('properties').find(isMetaProperty);

    if (metaPropPath) {
        const value = metaPropPath.get('value');
        if (!value.isObjectExpression()) {
            throw value.buildCodeFrameError('ObjectExpression expected here');
        }

        const meta: MessageMeta = {};

        value.get('properties').forEach((propPath) => {
            if (!propPath.isObjectProperty()) {
                return;
            }

            const key = parseStringValue(propPath.get('key'));

            if (key === 'id') {
                meta.id = parseStringValue(propPath.get('value'));
            } else if (key === 'description') {
                meta.description = parseStringValue(propPath.get('value'));
            } else if (key === 'markdown') {
                meta.markdown = parseBooleanValue(propPath.get('value'));
            } else if (key === 'disableTypograf') {
                meta.disableTypograf = parseBooleanValue(propPath.get('value'));
            }
        });

        return meta;
    }

    return undefined;
}

type TransformMessageValueParams = {
    path: NodePath;
    locale: string;
    meta?: MessageMeta;
    options: OptimizeMessageOptions;
};

function transformMessageValue({
    path,
    locale,
    meta,
    options,
}: TransformMessageValueParams): string | null {
    let value: string | null = null;

    if (path.isStringLiteral()) {
        value = path.node.value;
    } else if (path.isTemplateLiteral()) {
        if (path.node.expressions.length || path.node.quasis.length > 1) {
            throw path.buildCodeFrameError('Forbidden to use expressions in TemplateLiteral');
        }
        value = path.node.quasis[0]?.value.raw || '';
        if (!meta?.markdown) {
            value = minifyICUMessage(value);
        }
    } else if (path.isNullLiteral()) {
        value = null;
    }

    if (typeof value === 'string' && meta?.markdown) {
        value = transformMarkdownToHTML(value);
    }

    if (options.typografConfig && !meta?.disableTypograf && typeof value === 'string') {
        value = typograf(value, locale, options.typografConfig);
    }

    return value;
}

function optimizeMessage(path: NodePath<ObjectProperty>, options: OptimizeMessageOptions) {
    const {mode, allowedLocales, fallbackLocales} = options;
    const value = path.get('value');

    if (!value.isObjectExpression()) {
        throw value.buildCodeFrameError('ObjectExpression expected here');
    }

    const meta = getMetaFromMessage(value);
    const properties = value.get('properties');
    const localeValues: Record<string, string | null> = {};

    const getMessageReplacement = (path: NodePath, locale: string) => {
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
            const pluralValue: PluralValue = {};

            propValue.get('properties').forEach((pluralPropPath) => {
                if (!pluralPropPath.isObjectProperty()) {
                    return;
                }

                const pluralForm = parseStringValue(pluralPropPath.get('key'));
                const pluralFormValue = pluralPropPath.get('value');
                if (!pluralForms.includes(pluralForm as PluralForm)) {
                    throw pluralPropPath.buildCodeFrameError(
                        `Incorrect plural form. Supported plural forms: ${pluralForms.join(',')}`,
                    );
                }

                pluralValue[pluralForm as PluralForm] =
                    getMessageReplacement(pluralFormValue, locale) || '';
            });

            localeValues[locale] = convertLegacyPluralToICU(pluralValue);
            return;
        }

        localeValues[locale] = getMessageReplacement(propValue, locale);
    });

    if (mode === 'only-translations') {
        for (const locale of allowedLocales || []) {
            if (locale === TECH_LOCALE) {
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
                ? escapeHtmlTags(translation)
                : minifyICUMessage(translation);

            const compiledTranslation = parse(preparedTranslation, {
                // markdown должнен использоваться с ignoreTag: true
                ignoreTag: Boolean(meta?.markdown),
            });

            return types.objectProperty(
                types.stringLiteral(locale),
                types.valueToNode(compiledTranslation),
            );
        }

        return types.objectProperty(
            types.stringLiteral(locale),
            typeof translation === 'string'
                ? types.stringLiteral(translation)
                : types.nullLiteral(),
        );
    });

    value.replaceWith(types.objectExpression(newProperties));
}

function optimizeCreateMessages(path: NodePath<CallExpression>, options: OptimizeMessageOptions) {
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

export type TranslationsFileVisitorOptions = {
    typograf?: TypografConfig | boolean;
    mode?: 'default' | 'only-translations';
    compileMessageToAst?: boolean;
    allowedLocales?: string[];
    fallbackLocales?: FallbackLocales<string>;
};

export const createTranslationsFileVisitor = (
    options: TranslationsFileVisitorOptions = {},
): Visitor => {
    const mode = options.mode || 'default';
    const allowedLocales = options.allowedLocales || [];
    let typografConfig: TypografConfig | undefined;

    if (typeof options.typograf === 'object') {
        typografConfig = options.typograf;
    } else if (typeof options.typograf === 'undefined' || options.typograf) {
        typografConfig = DEFAULT_TYPOGRAF_CONFIG;
    }

    if (mode === 'only-translations' && !allowedLocales.length) {
        throw new Error('allowedLocales is required in only-translations mode');
    }

    return {
        ImportDeclaration(importPath) {
            if (mode === 'only-translations') {
                importPath.remove();
                return;
            }

            // Remove declareMessages import from @gravity-ui/i18n-types
            const source = importPath.node.source.value;
            if (source === '@gravity-ui/i18n-types') {
                const specifiers = importPath.node.specifiers.filter(
                    (s) =>
                        !(
                            types.isImportSpecifier(s) &&
                            types.isIdentifier(s.imported) &&
                            s.imported.name === 'declareMessages'
                        ),
                );

                if (specifiers.length === 0) {
                    importPath.remove();
                } else {
                    importPath.node.specifiers = specifiers;
                }
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

                if (!init.isCallExpression()) {
                    return;
                }

                const isDeclareMessages = isDeclareMessagesCall(init.node.callee);
                const isCreateMessages = isCreateMessagesCall(init.node.callee);

                if (!isDeclareMessages && !isCreateMessages) {
                    return;
                }

                const messagesObjectExpression = init.get('arguments')[0];

                if (
                    !messagesObjectExpression ||
                    !messagesObjectExpression.isObjectExpression()
                ) {
                    throw init.buildCodeFrameError('ObjectExpression expected here');
                }

                optimizeCreateMessages(init, {
                    typografConfig,
                    compileMessageToAst: options.compileMessageToAst,
                    fallbackLocales: options.fallbackLocales,
                    allowedLocales,
                    mode,
                });

                // Remove declareMessages wrapper, keep just the object
                if (isDeclareMessages) {
                    init.replaceWith(messagesObjectExpression.node);
                }

                if (options.mode === 'only-translations') {
                    const messagesObject = messagesObjectExpression.node;
                    const exportDefault = types.exportDefaultDeclaration(messagesObject);
                    exportPath.replaceWith(exportDefault);
                    return;
                }
            }
        },
    };
};
