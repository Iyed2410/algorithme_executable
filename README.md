# Algorithm Tunisia - VS Code Extension & CLI

This repository contains the source code for the "Algorithme-tn" Visual Studio Code extension and its command-line interpreter.

## Project Structure

- `src/`: TypeScript source code for the lexer, parser, interpreter, and VS Code extension.
- `out/`: Compiled JavaScript code.
- `syntaxes/`: TextMate grammar for `.algo` files.
- `snippets/`: Code snippets for common algorithmic structures.
- `test/`: Test files and examples.
- `images/`: Icons and screenshots.

## 🚀 Installation & Setup

### Pour les Étudiants (Configuration Rapide)
1. **Télécharger l'Installer** : Allez dans les "Releases" sur GitHub et téléchargez le dossier `installer`.
2. **Exécuter l'Installation** : 
   - Option A : Exécuter **`setup_algo_tn.exe`** (Installer Windows standard).
   - Option B : Clic-droit sur **`setup.ps1`** et choisir **Exécuter avec PowerShell** (nécessite des droits admin).
3. **Terminer** : L'installer ajoutera la commande `algo` à votre système et installable l'extension VS Code automatiquement.

### Pour les Développeurs (Générer le setup.exe)
Si vous voulez recréer l'installer vous-même :
1. Installez [Inno Setup](https://jrsoftware.org/isdl.php).
2. Ouvrez le fichier [setup.iss](file:///d:/iyed/Projects/algo-tn-vscode/installer/setup.iss) dans Inno Setup.
3. Cliquez sur **Compile**. Un fichier `setup_algo_tn.exe` sera généré dans le dossier `installer/Output`.

## 🛠 Utilisation

### Extension VS Code
- Ouvrez n'importe quel fichier `.algo` ou `.alg`.
- Appuyez sur **F5** ou cliquez sur le bouton **Play** en haut à droite.

### Commande CLI Globale
- Utilisez la commande `algo` dans n'importe quel terminal :
  ```bash
  algo mon_exercice.algo
  ```

## 📖 Nouvelles Fonctions
- `Afficher_Fichier("chemin")` : Affiche le contenu des fichiers texte ou binaires (`.dat`) directement dans le terminal avec une jolie mise en forme.
- `écrire_nl` (Console) : Ne saute plus de ligne automatiquement en console (comportement d'écriture standard).
