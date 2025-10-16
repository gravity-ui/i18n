/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/__tests__/*.spec.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
