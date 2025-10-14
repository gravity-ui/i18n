import {isLegacyPlural} from '../utils';

describe('legacy plural format', () => {
    it('should consider object as plural', () => {
        expect(isLegacyPlural({})).toBe(true);
    });
});
