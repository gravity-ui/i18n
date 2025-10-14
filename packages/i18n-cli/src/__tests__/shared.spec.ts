import {createRelativeImport} from '../shared';

describe('createRelativeImport', () => {
    it('to another directory', async () => {
        expect(createRelativeImport('server/utils/i18n.ts', 'server/controllers/main.ts')).toBe(
            '../utils/i18n',
        );
    });

    it('to same directory', async () => {
        expect(createRelativeImport('server/utils/i18n.ts', 'server/utils/main.ts')).toBe('./i18n');
    });

    it('to same directory with alias', async () => {
        expect(
            createRelativeImport('server/utils/i18n.ts', 'server/utils/main.ts', '@utils/i18n'),
        ).toBe('./i18n');
    });

    it('to another directory with alias', async () => {
        expect(
            createRelativeImport('server/utils/i18n.ts', 'server/views/index.ts', '@utils/i18n'),
        ).toBe('@utils/i18n');
    });
});
