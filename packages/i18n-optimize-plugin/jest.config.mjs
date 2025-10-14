/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest/presets/default-esm', // Использует ESM
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'], // Явно указываем, что TS-файлы — это ESM
    transform: {},
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    clearMocks: true,
};
