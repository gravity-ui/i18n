import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {pkg, bin} from './constants';
import {red} from 'picocolors';
import {Command, CommandContext} from './types';
import {createKeys} from './commands/create-keys';
import {findUnused} from './commands/find-unused';
import {loadProjectConfig} from '../config/loadProjectConfig';

export const run = async () => {
    const cwd = process.cwd();
    const argv = hideBin(process.argv);
    const {name, version} = pkg;

    const parsedArgs = await yargs
        .wrap(120)
        .version(version)
        .option('config', {
            alias: 'c',
            type: 'string',
            description: 'Путь к файлу с конфигурацией',
            requiresArg: false,
        })
        .parse(argv, {}, () => {});

    const args = yargs(argv);

    const projectConfig = loadProjectConfig(parsedArgs.config ? [parsedArgs.config] : undefined);

    const ctx: CommandContext = {bin, cwd, name, projectConfig};

    const commands: Command<string>[] = [createKeys, findUnused];

    commands.forEach((cmd) => {
        const {command, description, options, action} = cmd(ctx);

        args.command(
            command,
            description,
            (yargs) => {
                return options(yargs.usage(`${bin} ${command} [options]`));
            },
            async (args) => {
                try {
                    await action(args);
                } catch (error) {
                    const {message, stack} = error as Error;
                    console.log('');
                    console.error(red(stack || message));
                    process.exit(1);
                }
            },
        );
    });

    if (!argv.length) {
        args.showHelp();
    }

    await args.parse();
};

if (require.main === module) {
    run();
}
