import {
    LANGUAGES_DIR_EXPRESSION,
    ROOT_PROJECT_PATH,
    ROOT_PROJECT_EXPRESSION,
} from '../core/constants.js';
import crypto from 'crypto';
import type {Optimization, Chunk} from '@rspack/core';
import type {OptimizeLocaleChunks, Options} from '../types.js';

export const createI18nChunkExpression = (allowedLocales: string[]) =>
    new RegExp(`i18n\\.(?:${allowedLocales.join('|')})\\..+\\.js$`);

const toRelativePath = (path: string) =>
    path.startsWith(ROOT_PROJECT_PATH) ? path.replace(ROOT_PROJECT_EXPRESSION, '') : path;

function hashString(str: string) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function chunkNameFabric(optimizeLocaleChunks: OptimizeLocaleChunks) {
    if (
        typeof optimizeLocaleChunks === 'boolean' ||
        optimizeLocaleChunks.strategy === 'by-module'
    ) {
        return (_module: string, chunks: Chunk[]) => {
            const isInitial = chunks.some((chunk) => {
                return chunk.canBeInitial() || chunk.isOnlyInitial();
            });

            const chunkName = hashString(chunks.map((chunk) => chunk.name).join('-')).slice(0, 6);
            return isInitial ? `initial.${chunkName}` : chunkName;
        };
    }

    if (optimizeLocaleChunks.strategy === 'all-in-one') {
        return undefined;
    }

    if (optimizeLocaleChunks.strategy === 'custom') {
        return optimizeLocaleChunks.getChunkName;
    }

    throw new Error(`${optimizeLocaleChunks.strategy} is not supported`);
}

export function applySplitChunks(
    originalOptimization: Optimization | undefined,
    options: Options,
): Optimization | undefined {
    const {optimizeLocaleChunks} = options;

    if (!optimizeLocaleChunks) {
        return originalOptimization;
    }

    const getChunkName = chunkNameFabric(optimizeLocaleChunks);

    return {
        ...originalOptimization,
        splitChunks: {
            ...originalOptimization?.splitChunks,
            cacheGroups: {
                ...(originalOptimization?.splitChunks || {cacheGroups: {}}).cacheGroups,
                i18n: {
                    test: LANGUAGES_DIR_EXPRESSION,
                    name(module, chunks, cacheGroupKey) {
                        // @ts-expect-error resource is not typed
                        const modulePath = toRelativePath(module.resource!);

                        const match = modulePath.match(LANGUAGES_DIR_EXPRESSION)!;
                        const locale = match[1]!;
                        const chunkName = getChunkName?.(modulePath, chunks);

                        return chunkName
                            ? `${cacheGroupKey}.${locale}.${chunkName}`
                            : `${cacheGroupKey}.${locale}`;
                    },
                    chunks: 'all',
                    enforce: true,
                    reuseExistingChunk: true,
                    minChunks: 1,
                    priority: 50,
                },
            },
        },
    };
}
