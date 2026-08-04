import {loadProjectConfig, normalizeProjectConfig} from '@gravity-ui/i18n-cli/load-config';
import type {Options} from './types.js';

/**
 * Возвращает конфигурацию проекта: переданный опцией объект, конфиг по указанному пути
 * либо найденный поиском от текущей рабочей директории. Переданный объект проходит ту же
 * нормализацию, что и найденный на диске, поэтому дефолты не зависят от способа передачи.
 */
export function resolveProjectConfig(config: Options['config']) {
    if (typeof config === 'object') {
        return normalizeProjectConfig(config);
    }

    return loadProjectConfig(config ? {configPath: config} : undefined);
}
