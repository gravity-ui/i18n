import {ProjectConfig} from './types';

export function defineConfig<Locales extends string[]>(config: ProjectConfig<Locales>) {
    return config;
}
