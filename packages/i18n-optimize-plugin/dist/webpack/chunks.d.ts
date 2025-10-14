import type { Optimization } from '@rspack/core';
import type { Options } from '../types.js';
export declare const createI18nChunkExpression: (allowedLocales: string[]) => RegExp;
export declare function applySplitChunks(originalOptimization: Optimization | undefined, options: Options): Optimization | undefined;
