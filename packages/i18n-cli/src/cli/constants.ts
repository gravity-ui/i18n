export enum Commands {
    CreateKeys = 'create-keys',
    FindUnused = 'find-unused',
}

export const pkg: {
    name: string;
    version: string;
    bin: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
} = require('../../package.json');

export const bin = Object.keys(pkg.bin)[0] as string;
