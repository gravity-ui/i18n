import * as vscode from 'vscode';
import {exec} from 'child_process';

const EXTENSION_NAME = 'I18n init keys';

const main = () => {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document.fileName;

    if (!currentlyOpenTabfilePath) {
        vscode.window.showErrorMessage('Не открыт файл.');
        return;
    }

    // Определяем рабочую директорию - корень проекта
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Не найдена рабочая директория проекта.');
        return;
    }

    const workspaceRoot = workspaceFolders[0]?.uri.fsPath;
    if (!workspaceRoot) {
        vscode.window.showErrorMessage('Не найдена рабочая директория проекта.');
        return;
    }

    const command = `npm exec -- i18n-cli create-keys "${currentlyOpenTabfilePath}"`;

    vscode.window.showInformationMessage('Генерация ключей...');

    exec(command, {cwd: workspaceRoot, env: process.env}, async (error, stdout, stderr) => {
        const outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
        outputChannel.appendLine(`Команда: ${command}`);
        outputChannel.appendLine(`В директории: ${workspaceRoot}`);

        if (!error && !stderr) {
            vscode.window.showInformationMessage('Ключи успешно инициализированы');
            await vscode.window.activeTextEditor?.document.save();
            outputChannel.appendLine(stdout);
            return;
        }

        if (error) {
            outputChannel.appendLine(`Ошибка: ${error.message}`);
            vscode.window.showErrorMessage(`Ошибка при генерации ключей: ${error.message}`);
            outputChannel.show();
            return;
        }

        if (stderr) {
            outputChannel.appendLine(`stderr: ${stderr}`);
            outputChannel.show();
        }
    });
};

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('I18nInitKeys.I18nInitKeys', main);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
