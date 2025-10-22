import type {Argv} from 'yargs';
import {NormalizedProjectConfig} from '../config/loadProjectConfig';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlainObject<T = any> = {
    [key: string]: T;
};

export type CommandContext = {
    name: string;
    bin: string;
    cwd: string;
    projectConfig: NormalizedProjectConfig;
};

export interface CommandOutput<CMD extends string, Options, Result> {
    command: `${CMD} ${string}` | `${CMD}`;
    description: string;
    options(yargs: Argv<Options>): void;
    action(args: Options): Result | Promise<Result>;
}

export interface Command<CMD extends string, Options = PlainObject, Result = unknown> {
    (ctx: CommandContext): CommandOutput<CMD, Options, Result>;
}
