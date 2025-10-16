import type {IntlCache} from '@formatjs/intl';

import {clearCacheOnPlace} from '../cache';

describe('clear intl cache', () => {
    it('should clear all fields', () => {
        const cache: IntlCache = {
            // @ts-expect-error
            dateTime: {test: {}},
            // @ts-expect-error
            number: {test: {}},
            // @ts-expect-error
            message: {test: {}},
            // @ts-expect-error
            relativeTime: {test: {}},
            // @ts-expect-error
            pluralRules: {test: {}},
            // @ts-expect-error
            list: {test: {}},
            // @ts-expect-error
            displayNames: {test: {}},
        };

        clearCacheOnPlace(cache);

        expect(cache).toEqual({
            dateTime: {},
            number: {},
            message: {},
            relativeTime: {},
            pluralRules: {},
            list: {},
            displayNames: {},
        });
    });
});
