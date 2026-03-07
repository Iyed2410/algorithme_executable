# Algorithm Tunisia - VS Code Extension & CLI

This repository contains the Visual Studio Code extension and the Command Line Interface (CLI) to execute code following the official algorithmic conventions taught in Tunisian high schools (2024-2025 Program).

## Features 🚀

- **Syntax Highlighting**: Full support for `.algo` files (French keywords, predefined functions, operators).
- **Integrated Interpreter**: Run your code directly by pressing a button without needing external tools.
- **File Manipulation**: Fully supports opening (`ouvrir`), reading/writing (`lire`, `écrire_nl`), array management (`tab`), and binary files (`.dat`) according to the official curriculum.
- **Global Execution**: Launch your algorithms from any folder on your computer using the `algo` command.

---

## 🛠️ Required Installation (Prerequisites)

To make the extension and global command work, your system needs Node.js.
If you don't have it yet:
1. Download and install **Node.js** from [nodejs.org](https://nodejs.org/).
2. During installation, leave all default options (make sure "Add to PATH" is checked).

---

## 📥 1. Global Command Installation (CLI)

Once Node.js is installed, you need to register the `algo` command in your system.

Open the Command Prompt (`cmd`) or PowerShell in the folder you just downloaded (where this README file is located) and type:

```bash
npm install -g .
```

**Verification:**
Close the terminal, open a new one, and type:
```bash
algo
```
If a usage message appears (`Usage: node out/test-runner.js <file.algo>`), the installation was successful!
You can now run any algorithm file from any folder: `algo my_program.algo`

---

## 💻 2. Visual Studio Code Extension Installation

The extension provides syntax highlighting, snippets, and the **F5** key (or Play button) to run your code directly from the editor.

1. **Download** the `algorithme-tn-0.1.0.vsix` file provided in this release/repository.
2. Open **Visual Studio Code**.
3. Go to the **Extensions** tab (square icon on the left) or press `Ctrl+Shift+X`.
4. Click on the **three dots `...`** at the top right of the extensions panel.
5. Select **Install from VSIX...**.
6. Find and select the `algorithme-tn-0.1.0.vsix` file you just downloaded.
7. (**Optional**): If VS Code asks, click "Reload Window".

---

## 📝 How to use it?

1. Create a new folder for your exercises.
2. Create a file ending with **`.algo`** (e.g., `exercise1.algo`).
3. Write your code in pseudo-code according to the convention (e.g., `algorithme test\ndébut\nécrire("Hello World!")\nfin`).
4. **Press `F5`** on your keyboard, or click the Play button at the top right.
5. The VS Code Integrated Terminal will open, ask for your inputs `Saisir X: `, and display your results!
