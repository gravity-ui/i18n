import type {FilenameMatcher, TypografConfig} from '@gravity-ui/i18n-babel-plugin';
import type {ProjectConfig} from '@gravity-ui/i18n-cli/config';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getChunkName: (module: string, chunks: any[]) => string;
}

export type OptimizeLocaleChunks = boolean | BaseOptimizeLocaleChunks | CustomOptimizeLocaleChunks;

export interface Options {
    /**
     * Конфигурация проекта: объект — используется как есть, строка — путь до файла конфига.
     * По умолчанию `i18n.config.ts` ищется от текущей рабочей директории до корня репозитория.
     *
     * Стоит задать явно, если сборка запускается из директории, из которой конфиг не находится,
     * либо чтобы не платить за его поиск.
     */
    config?: ProjectConfig | string;
    /**
     * Позволяет обрабатывать файлы с переводами с кастомными названиями.
     *
     * Строка сравнивается с концом пути, `RegExp` (либо его сериализуемая форма
     * `{type: 'regexp', pattern, flags}`) проверяется на нормализованном пути.
     *
     * По умолчанию используется `'i18n.ts'`.
     */
    filenameMatcher?: FilenameMatcher | FilenameMatcher[];
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
