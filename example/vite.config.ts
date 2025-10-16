import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import I18nOptimizePlugin from '@gravity-ui/i18n-optimize-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tsconfigPaths(), react(), I18nOptimizePlugin()],
});
