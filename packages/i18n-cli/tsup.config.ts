// @ts-check
import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/cli/run.ts', 'src/config/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    treeshake: true,
    bundle: true,
    skipNodeModulesBundle: true,
    outDir: 'dist',
    outExtension({format}) {
        return {
            js: format === 'esm' ? '.mjs' : '.js',
        };
    },
    esbuildOptions(options) {
        options.outbase = 'src';
        options.loader = {
            ...(options.loader || {}),
            '.json': 'json',
        };
    },
});
