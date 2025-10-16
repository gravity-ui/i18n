import type {IntlCache} from '@formatjs/intl';

export const clearCacheOnPlace = (cache: IntlCache) => {
    Object.keys(cache).forEach((key) => {
        cache[key as keyof typeof cache] = {};
    });
};
