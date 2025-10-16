import {Command} from './types';

export function createCommand<CMD extends string, Options, Result>(
    fn: Command<CMD, Options, Result>,
): Command<CMD, Options, Result> {
    return (ctx) => {
        const res = fn(ctx);
        return res;
    };
}
