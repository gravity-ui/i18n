import * as vscode from 'vscode';
import {execFile} from 'child_process';
import {existsSync} from 'fs';
import path from 'path';

const EXTENSION_NAME = 'I18n init keys';

let outputChannel: vscode.OutputChannel;

function findClosestPackageDir(filePath: string): string | undefined {
    let dir = path.dirname(filePath);
    while (dir !== path.dirname(dir)) {
        if (existsSync(path.join(dir, 'package.json'))) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    return undefined;
}

const main = () => {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;

    if (!currentlyOpenTabfilePath) {
        vscode.window.showErrorMessage('Не открыт файл.');
        return;
    }

    // Define workspace folder - root of the project
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Workspace folder not found.');
        return;
    }

    const workspaceRoot = workspaceFolders[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Workspace folder not found.');
        return;
    }

    const packageDir = findClosestPackageDir(currentlyOpenTabfilePath) || workspaceRoot;

    const usePnpm =
        existsSync(path.join(workspaceRoot, 'pnpm-lock.yaml')) ||
        existsSync(path.join(workspaceRoot, 'pnpm-workspace.yaml'));

    const command = usePnpm
        ? `pnpm -C "${packageDir}" exec -- i18n-cli create-keys "${currentlyOpenTabfilePath}"`
        : `npm exec -- i18n-cli create-keys "${currentlyOpenTabfilePath}"`;

    vscode.window.showInformationMessage('Generating keys...');

    // Use login+interactive shell to ensure nvm/fnm/etc are initialized
    const shell = process.env.SHELL || '/bin/sh';
    const cwd = usePnpm ? workspaceRoot : packageDir;

    execFile(shell, ['-lic', command], {cwd}, async (error, stdout, stderr) => {
        outputChannel.appendLine(`Command: ${shell} -lic ${command}`);
        outputChannel.appendLine(`In directory: ${cwd}`);

        if (stdout) {
            outputChannel.appendLine(stdout);
        }

        if (stderr) {
            outputChannel.appendLine(`Stderr: ${stderr}`);
        }

        if (error && error.code) {
            outputChannel.appendLine(`Error (exit code ${error.code}): ${error.message}`);
            vscode.window.showErrorMessage(`Error when generating keys: ${error.message}`);
            outputChannel.show();
            return;
        }

        vscode.window.showInformationMessage('Keys successfully initialized');
        await vscode.window.activeTextEditor?.document.save();
    });
};

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
    context.subscriptions.push(outputChannel);

    const disposable = vscode.commands.registerCommand('I18nInitKeys.I18nInitKeys', main);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
