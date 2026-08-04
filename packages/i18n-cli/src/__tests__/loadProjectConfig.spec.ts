import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadProjectConfig, normalizeProjectConfig} from '../config/loadProjectConfig';

const CONFIG_CONTENT = (locales: string[]) =>
    `module.exports = {allowedLocales: ${JSON.stringify(locales)}, fallbackLocales: {kk: 'ru'}};`;

let tempDir: string;

function createDir(...segments: string[]) {
    const dir = join(tempDir, ...segments);
    mkdirSync(dir, {recursive: true});
    return dir;
}

beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'i18n-cli-config-'));
});

afterEach(() => {
    rmSync(tempDir, {recursive: true, force: true});
});

describe('loadProjectConfig', () => {
    it('finds the config in the workspace root when called from a package directory', () => {
        const root = createDir('repo');
        const packageDir = createDir('repo', 'apps', 'app');
        writeFileSync(join(root, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'\n");
        writeFileSync(join(root, 'i18n.config.js'), CONFIG_CONTENT(['ru', 'en', 'tr', 'kk']));

        const config = loadProjectConfig({cwd: packageDir});

        expect(config.allowedLocales).toEqual(['ru', 'en', 'tr', 'kk']);
        expect(config.fallbackLocales).toEqual({kk: 'ru'});
    });

    it('does not search above the workspace root', () => {
        const root = createDir('repo');
        const packageDir = createDir('repo', 'apps', 'app');
        writeFileSync(join(root, 'pnpm-workspace.yaml'), "packages:\n  - 'apps/*'\n");
        writeFileSync(join(tempDir, 'i18n.config.js'), CONFIG_CONTENT(['tr']));

        const config = loadProjectConfig({cwd: packageDir});

        expect(config.allowedLocales).toEqual(['ru', 'en']);
    });

    it('respects an explicit stopDir', () => {
        const packageDir = createDir('repo', 'apps', 'app');
        writeFileSync(join(tempDir, 'repo', 'i18n.config.js'), CONFIG_CONTENT(['ru', 'tr']));

        const found = loadProjectConfig({cwd: packageDir, stopDir: join(tempDir, 'repo')});
        const notFound = loadProjectConfig({cwd: packageDir, stopDir: packageDir});

        expect(found.allowedLocales).toEqual(['ru', 'tr']);
        expect(notFound.allowedLocales).toEqual(['ru', 'en']);
    });

    it('loads the config from an explicit configPath', () => {
        const configPath = join(createDir('anywhere'), 'custom.config.js');
        writeFileSync(configPath, CONFIG_CONTENT(['en', 'kk']));

        const config = loadProjectConfig({configPath});

        expect(config.allowedLocales).toEqual(['en', 'kk']);
    });

    it('caches per resolved options instead of globally', () => {
        const firstRoot = createDir('first');
        const secondRoot = createDir('second');
        writeFileSync(join(firstRoot, 'pnpm-workspace.yaml'), '');
        writeFileSync(join(secondRoot, 'pnpm-workspace.yaml'), '');
        writeFileSync(join(firstRoot, 'i18n.config.js'), CONFIG_CONTENT(['ru']));
        writeFileSync(join(secondRoot, 'i18n.config.js'), CONFIG_CONTENT(['en']));

        expect(loadProjectConfig({cwd: firstRoot}).allowedLocales).toEqual(['ru']);
        expect(loadProjectConfig({cwd: secondRoot}).allowedLocales).toEqual(['en']);
    });

    it('fills in the defaults when no config is found', () => {
        const packageDir = createDir('repo', 'apps', 'app');
        writeFileSync(join(tempDir, 'repo', 'pnpm-workspace.yaml'), '');

        const config = loadProjectConfig({cwd: packageDir});

        expect(config).toMatchObject({
            allowedLocales: ['ru', 'en'],
            clientIntlModule: {path: 'src/ui/shared/i18n.ts'},
            serverIntlModule: {path: 'src/server/utils/i18n.ts'},
        });
        expect(config.serverIntlModule.pathMatchers).toHaveLength(1);
    });

    it('normalizeProjectConfig applies the same defaults to a config passed directly', () => {
        expect(normalizeProjectConfig({allowedLocales: ['ru', 'en', 'tr', 'kk']})).toMatchObject({
            allowedLocales: ['ru', 'en', 'tr', 'kk'],
            clientIntlModule: {path: 'src/ui/shared/i18n.ts'},
            serverIntlModule: {path: 'src/server/utils/i18n.ts'},
        });

        expect(normalizeProjectConfig().allowedLocales).toEqual(['ru', 'en']);
    });

    it('keeps the legacy searchPlaces argument working', () => {
        const root = createDir('repo');
        const packageDir = createDir('repo', 'apps', 'app');
        writeFileSync(join(root, 'pnpm-workspace.yaml'), '');
        writeFileSync(join(root, 'custom.config.js'), CONFIG_CONTENT(['ru', 'tr']));

        const initialCwd = process.cwd();

        try {
            process.chdir(packageDir);
            expect(loadProjectConfig(['custom.config.js']).allowedLocales).toEqual(['ru', 'tr']);
        } finally {
            process.chdir(initialCwd);
        }
    });
});
