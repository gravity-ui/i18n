import * as vscode from 'vscode';
import {exec} from 'child_process';

const EXTENSION_NAME = 'I18n init keys';

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

    const pnpmCommand = `pnpm exec -- i18n-cli create-keys "${currentlyOpenTabfilePath}"`;
    const npmCommand = `npm exec -- i18n-cli create-keys "${currentlyOpenTabfilePath}"`;

    const command = `[[ -f "${workspaceRoot}/pnpm-lock.yaml" || -f "${workspaceRoot}/pnpm-workspace.yaml" ]] && ${pnpmCommand} || ${npmCommand}`;

    vscode.window.showInformationMessage('Generating keys...');

    exec(command, {cwd: workspaceRoot, env: process.env}, async (error, stdout, stderr) => {
        const outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        outputChannel.appendLine(`Command: ${command}`);
        outputChannel.appendLine(`In directory: ${workspaceRoot}`);

        if (!error && !stderr) {
            vscode.window.showInformationMessage('Keys successfully initialized');
            await vscode.window.activeTextEditor?.document.save();
            outputChannel.appendLine(stdout);
            return;
        }

        if (error) {
            outputChannel.appendLine(`Error: ${error.message}`);
            vscode.window.showErrorMessage(`Error when generating keys: ${error.message}`);
            outputChannel.show();
            return;
        }

        if (stderr) {
            outputChannel.appendLine(`Stderr: ${stderr}`);
            outputChannel.show();
        }
    });
};

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('I18nInitKeys.I18nInitKeys', main);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
