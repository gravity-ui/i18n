import type { TypografConfig } from '@gravity-ui/i18n-babel-plugin';
interface CommonOptimizeLocaleChunks {
    /**
     * Имя переменной, которая хранит текущий язык.
     * По умолчанию используется `window.I18N_LANG`.
     */
    runtimeLanguageVariableName?: string;
    /**
     * Добавляет к генерации техническую локаль, в значениях которой содержатся ID из meta.
     * По умолчанию отключено (false).
     */
    generateTechLocale?: boolean;
    /**
     * Шаблон имени файла для генерации локальных манифестов.
     * Поддерживается {locale} в качестве заполнителя для текущего языка.
     * По умолчанию используется `assets-manifest.{locale}.json`.
     */
    assetsManifestFileName?: string;
}
interface BaseOptimizeLocaleChunks extends CommonOptimizeLocaleChunks {
    /**
     * Стратегия создания языковых чанков.
     * По умолчанию используется `by-module`.
     *
     * `all-in-one` - общий чанк, в котором собраны переводы со всего проекта для одного языка.
     *
     * `by-module` - на каждый модуль (i18n.ts) создаются отдельные чанки.
     */
    strategy?: 'all-in-one' | 'by-module';
}
interface CustomOptimizeLocaleChunks extends CommonOptimizeLocaleChunks {
    /**
     * Кастомная стратегия создания языковых чанков.
     * Используется кастомная функция для получения имени чанка.
     */
    strategy: 'custom';
    /**
     * Функция, которая возвращает имя чанка для модуля.
     */
    getChunkName: (module: string, chunks: any[]) => string;
}
export type OptimizeLocaleChunks = boolean | BaseOptimizeLocaleChunks | CustomOptimizeLocaleChunks;
export interface Options {
    /**
     * Конфигурация для типографа.
     * По умолчанию включен (true).
     */
    typograph?: TypografConfig | boolean;
    /**
     * Оптимизирует загрузку чанков в зависимости от текущего языка.
     * Поддерживается только в режиме production для webpack/rspack.
     * По умолчанию отключено (false).
     */
    optimizeLocaleChunks?: OptimizeLocaleChunks;
    /**
     * [BETA]
     * Компилирует переводы в AST.
     * По умолчанию отключено (false).
     */
    compileMessageToAst?: boolean;
}
export {};
