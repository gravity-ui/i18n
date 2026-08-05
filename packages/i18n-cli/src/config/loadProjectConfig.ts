import {existsSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {cosmiconfigSync} from 'cosmiconfig';
import {TypeScriptLoaderSync} from 'cosmiconfig-typescript-loader';
import {log, MODULE_NAME} from '../shared';
import {ProjectConfig} from './types';

const DEFAULT_LOCALES = ['ru', 'en'];
const DEFAULT_CLIENT_INTL_PATH = 'src/ui/shared/i18n.ts';
const DEFAULT_SERVER_INTL_PATH = 'src/server/utils/i18n.ts';
const DEFAULT_SERVER_PATH_MATCHERS = [/src\/server\/.+$/];

type RequiredConfigOption = 'clientIntlModule' | 'serverIntlModule';

export type NormalizedProjectConfig = Omit<ProjectConfig, RequiredConfigOption> &
    Required<Pick<ProjectConfig, RequiredConfigOption>>;

/**
 * Подставляет дефолты в конфиг проекта: локали, пути до intl-модулей и матчеры серверных путей.
 * Экспортируется, чтобы конфиг, переданный в обход поиска по файловой системе, получал те же
 * значения по умолчанию, что и найденный на диске.
 */
export function normalizeProjectConfig(projectConfig?: ProjectConfig): NormalizedProjectConfig {
    const clientIntlModule = projectConfig?.clientIntlModule;
    const serverIntlModule = projectConfig?.serverIntlModule;

    return {
        ...projectConfig,
        allowedLocales: projectConfig?.allowedLocales || DEFAULT_LOCALES,
        clientIntlModule: {
            ...clientIntlModule,
            path: clientIntlModule?.path || DEFAULT_CLIENT_INTL_PATH,
        },
        serverIntlModule: {
            ...serverIntlModule,
            path: serverIntlModule?.path || DEFAULT_SERVER_INTL_PATH,
            pathMatchers: serverIntlModule?.pathMatchers || DEFAULT_SERVER_PATH_MATCHERS,
        },
    };
}

// Порядок влияет на приоритеты
const DEFAULT_SEARCH_PLACES = ['i18n.config.ts', 'i18n.config.js'];

/**
 * Файлы, по которым определяется корень репозитория или воркспейса.
 * Проверяются снизу вверх, побеждает ближайший к стартовой директории — так поиск
 * не выходит за пределы репозитория.
 */
const WORKSPACE_ROOT_MARKERS = [
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    'bun.lockb',
    'deno.lock',
    'lerna.json',
    'nx.json',
    'turbo.json',
    '.git',
];

function hasWorkspacesField(dir: string) {
    try {
        const packageJson = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf-8'));
        return Boolean(packageJson.workspaces);
    } catch (_err) {
        return false;
    }
}

/**
 * Ищет корень репозитория или воркспейса, поднимаясь вверх от `from`.
 *
 * Нужен как граница поиска конфига: в монорепозиториях сборка запускается из директории
 * пакета (`apps/<app>`), а `i18n.config.ts` лежит в корне. Без этого поиск ограничен
 * стартовой директорией и корневой конфиг не находится.
 *
 * @returns путь до корня либо `undefined`, если ни одного маркера вверх по дереву нет
 */
function findWorkspaceRoot(from: string): string | undefined {
    let current = from;

    for (;;) {
        const isRoot =
            WORKSPACE_ROOT_MARKERS.some((marker) => existsSync(resolve(current, marker))) ||
            hasWorkspacesField(current);

        if (isRoot) {
            return current;
        }

        const parent = dirname(current);

        if (parent === current) {
            return undefined;
        }

        current = parent;
    }
}

export type LoadProjectConfigOptions = {
    /**
     * Имена файлов конфига в порядке приоритета.
     * По умолчанию `['i18n.config.ts', 'i18n.config.js']`.
     */
    searchPlaces?: string[];

    /**
     * Директория, с которой начинается поиск вверх по дереву.
     * По умолчанию `process.cwd()`.
     */
    cwd?: string;

    /**
     * Директория, на которой поиск останавливается.
     * По умолчанию — корень репозитория или воркспейса, а если маркеров корня нет — `cwd`.
     */
    stopDir?: string;

    /**
     * Путь до конкретного файла конфига. Если задан, поиск не выполняется.
     */
    configPath?: string;
};

const configCache = new Map<string, NormalizedProjectConfig>();

export const loadProjectConfig = (
    options?: string[] | LoadProjectConfigOptions,
): NormalizedProjectConfig => {
    const {
        searchPlaces = DEFAULT_SEARCH_PLACES,
        cwd = process.cwd(),
        stopDir,
        configPath,
    } = Array.isArray(options) ? {searchPlaces: options} : (options ?? {});

    const searchFrom = resolve(cwd);
    const resolvedStopDir = stopDir ?? findWorkspaceRoot(searchFrom) ?? searchFrom;
    const cacheKey = JSON.stringify([configPath, searchFrom, resolvedStopDir, searchPlaces]);

    const cachedProjectConfig = configCache.get(cacheKey);

    if (cachedProjectConfig) {
        return cachedProjectConfig;
    }

    const explorer = cosmiconfigSync(MODULE_NAME, {
        cache: false,
        stopDir: resolvedStopDir,
        searchPlaces,
        loaders: {
            '.ts': TypeScriptLoaderSync(),
        },
    });

    const cfg = configPath ? explorer.load(configPath) : explorer.search(searchFrom);

    if (!cfg) {
        log(
            `i18n config (${searchPlaces.join(', ')}) not found in "${searchFrom}" up to "${resolvedStopDir}". Using default values`,
        );
    }

    const config = normalizeProjectConfig(cfg?.config as ProjectConfig | undefined);

    configCache.set(cacheKey, config);
    return config;
};
