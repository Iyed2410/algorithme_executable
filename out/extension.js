"use strict";
// ─── VS Code Extension Entry Point ───
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
let outputChannel;
function activate(context) {
    outputChannel = vscode.window.createOutputChannel('Algorithme');
    const runCommand = vscode.commands.registerCommand('algorithme-tn.run', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Aucun fichier ouvert.');
            return;
        }
        if (editor.document.languageId !== 'algo') {
            vscode.window.showWarningMessage("Ce fichier n'est pas un fichier .algo");
            return;
        }
        // Save the file first
        await editor.document.save();
        const source = editor.document.getText();
        const filePath = editor.document.uri.fsPath;
        const workDir = path.dirname(filePath);
        try {
            // Find existing terminal or create a new one
            const termName = 'Algorithme-tn';
            let terminal = vscode.window.terminals.find(t => t.name === termName);
            if (!terminal) {
                terminal = vscode.window.createTerminal(termName);
            }
            terminal.show();
            // Clear the terminal and run the file using the global 'algo' command
            // We wrap the path in quotes to handle spaces
            terminal.sendText(`algo "${filePath}"`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Erreur lors du lancement du terminal: ${error}`);
        }
    });
    context.subscriptions.push(runCommand, outputChannel);
}
function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}
//# sourceMappingURL=extension.js.map