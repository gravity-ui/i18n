import {
    isLegacyPlural,
    type MessageMeta,
    type MessageValue,
    type PluralValue,
    type Message,
} from '@gravity-ui/i18n-types';
import {writeFile} from 'node:fs/promises';
import {parse, resolve} from 'node:path';
import type {MessageWithPlacementMeta, ExportAliases} from './types';
import {
    createRelativeImport,
    toAbsolutePath,
    TRANSLATIONS_FILE_POSTFIX,
    formatCode,
    isMessageLikeMultilineICU,
    log,
} from './shared';
import {builders as b} from 'estree-toolkit';
import {generate} from 'astring';
import {AssignmentProperty, ObjectExpression, Property} from 'estree';
import parseIcuMessage from 'format-message-parse';
import createPrettyIcuMessage from 'format-message-print';
import {loadProjectConfig, NormalizedProjectConfig} from './config/loadProjectConfig';
import {DEFAULT_EXPORT_ALIASES} from './constants';

export type GenerateTranslationsFileParams = {
    outputPath: string;
    messages: MessageWithPlacementMeta[];
    exportAliases?: ExportAliases;
};

function prettifyMultilineICU(message: string): string {
    try {
        const ast = parseIcuMessage(message);
        return createPrettyIcuMessage(ast);
    } catch (_err) {
        return message;
    }
}

function generateMessageLiteral(message?: string | null, meta?: MessageMeta) {
    if (message === undefined) {
        return b.identifier('undefined');
    }

    if (message === null) {
        return b.literal(null);
    }

    if (!meta?.markdown && isMessageLikeMultilineICU(message)) {
        const prettyICU = '\n' + prettifyMultilineICU(message);
        return b.templateLiteral(
            [b.templateElement({raw: prettyICU, cooked: prettyICU}, true)],
            [],
        );
    }

    return b.literal(message);
}

function generateLegacyPluralObject(value: PluralValue, meta?: MessageMeta): ObjectExpression {
    return b.objectExpression(
        Object.entries(value).map(([form, formValue]) =>
            b.property(
                'init',
                b.identifier(form),
                generateMessageLiteral(formValue as string | undefined, meta),
            ),
        ),
    );
}

function generateMeta(meta: MessageMeta): ObjectExpression | undefined {
    const properties: ObjectExpression['properties'] = [];

    if (meta.id) {
        properties.push(b.property('init', b.identifier('id'), b.literal(meta.id)));
    }

    if (meta.description) {
        properties.push(
            b.property('init', b.identifier('description'), b.literal(meta.description)),
        );
    }

    if (typeof meta.markdown === 'boolean') {
        properties.push(b.property('init', b.identifier('markdown'), b.literal(meta.markdown)));
    }

    if (typeof meta.disableTypograf === 'boolean') {
        properties.push(
            b.property('init', b.identifier('disableTypograf'), b.literal(meta.disableTypograf)),
        );
    }

    return properties.length ? b.objectExpression(properties) : undefined;
}

function generateMessageObject(
    message: Message<never>,
    allowedLocales: string[],
): ObjectExpression {
    const propsRecord: Record<string, Property> = {};
    let metaProp: Property | undefined;

    for (const [key, val] of Object.entries(message)) {
        let node: Property['value'] | undefined = undefined;

        if (key === 'meta') {
            const metaObj = generateMeta(val as MessageMeta);
            if (metaObj) {
                metaProp = b.property('init', b.literal('meta'), metaObj);
            }
        } else if (isLegacyPlural(val as MessageValue)) {
            node = generateLegacyPluralObject(val as PluralValue, message.meta);
        } else if (typeof val === 'string' || val === null) {
            node = generateMessageLiteral(val, message.meta);
        }

        if (node) {
            propsRecord[key] = b.property('init', b.literal(key), node);
        }
    }

    // Ensure required locales with null if missing
    const sortedProps = allowedLocales.map(
        (locale) => propsRecord[locale] || b.property('init', b.literal(locale), b.literal(null)),
    );

    if (metaProp) {
        sortedProps.push(metaProp);
    }

    return b.objectExpression(sortedProps);
}

function generateMessagesObject(
    messages: MessageWithPlacementMeta[],
    allowedLocales: string[],
): ObjectExpression {
    const sortedMessages = messages
        .slice()
        .sort((a, b) =>
            a.meta.objectKey.localeCompare(b.meta.objectKey, 'en', {sensitivity: 'case'}),
        );

    return b.objectExpression(
        sortedMessages.map(({message, meta}) =>
            b.property(
                'init',
                b.literal(meta.objectKey),
                generateMessageObject(message, allowedLocales),
            ),
        ),
    );
}

function determineIntlModule(outputPath: string, config: NormalizedProjectConfig) {
    return config.serverIntlModule.pathMatchers?.some((m) => m.test(outputPath))
        ? config.serverIntlModule
        : config.clientIntlModule;
}

export function generateTranslationsFileContent(params: GenerateTranslationsFileParams): string {
    const config = loadProjectConfig();

    const intlModule = determineIntlModule(params.outputPath, config);
    const intlImportPath = createRelativeImport(
        intlModule.path,
        params.outputPath,
        intlModule.alias,
    );

    const {exportAliases} = params;
    const tExportName = exportAliases?.t || DEFAULT_EXPORT_ALIASES.t;
    const messageExportName = exportAliases?.Message || DEFAULT_EXPORT_ALIASES.Message;

    const content = generate(
        b.program(
            [
                b.exportNamedDeclaration(
                    b.variableDeclaration('const', [
                        b.variableDeclarator(
                            b.objectPattern(
                                intlModule === config.serverIntlModule
                                    ? [
                                          b.property(
                                              'init',
                                              b.identifier('messages'),
                                              b.identifier('messages'),
                                              false,
                                              true,
                                          ) as AssignmentProperty,
                                      ]
                                    : [
                                          b.property(
                                              'init',
                                              b.identifier(DEFAULT_EXPORT_ALIASES.t),
                                              b.identifier(tExportName),
                                              false,
                                              tExportName === DEFAULT_EXPORT_ALIASES.t,
                                          ) as AssignmentProperty,
                                          b.property(
                                              'init',
                                              b.identifier(DEFAULT_EXPORT_ALIASES.Message),
                                              b.identifier(messageExportName),
                                              false,
                                              messageExportName === DEFAULT_EXPORT_ALIASES.Message,
                                          ) as AssignmentProperty,
                                      ],
                            ),
                            b.callExpression(
                                b.memberExpression(
                                    b.identifier('intl'),
                                    b.identifier('createMessages'),
                                ),
                                [generateMessagesObject(params.messages, config.allowedLocales)],
                            ),
                        ),
                    ]),
                ),
            ],
            'module',
        ),
    );

    return `import {intl} from "${intlImportPath}";\n\n${content}`;
}

function generateOutputFilename(outputPath: string) {
    const absPath = toAbsolutePath(outputPath);
    const parsedPath = parse(absPath);

    if (absPath.endsWith(TRANSLATIONS_FILE_POSTFIX)) {
        return absPath;
    }

    return resolve(parsedPath.ext ? parsedPath.dir : absPath, TRANSLATIONS_FILE_POSTFIX);
}

export async function generateTranslationsFile(params: GenerateTranslationsFileParams) {
    const translationsFilePath = generateOutputFilename(params.outputPath);
    const content = generateTranslationsFileContent(params);

    try {
        const prettyCode = await formatCode(content, translationsFilePath);
        await writeFile(translationsFilePath, prettyCode);
    } catch (err) {
        log(`Failed to generate translations file: ${translationsFilePath}`, err);
        throw err;
    }
}
