# Algorithme Tunisie - VS Code Extension & CLI

Ce dépôt contient l'extension Visual Studio Code ainsi que l'interface en ligne de commande (CLI) pour exécuter du code selon les conventions algorithmiques officielles enseignées dans les lycées tunisiens (Programme 2024-2025).

## Fonctionnalités 🚀

- **Coloration Syntaxique** : Prise en charge complète pour les fichiers `.algo` (mots-clés en français, fonctions prédéfinies, opérateurs).
- **Interpréteur Intégré** : Exécutez votre code directement en appuyant sur un bouton sans avoir besoin d'outils externes.
- **Manipulation de Fichiers** : Supporte pleinement l'ouverture (`ouvrir`), la lecture/écriture (`lire`, `écrire_nl`), la gestion des tableaux (`tab`) et des fichiers binaires (`.dat`) selon le programme officiel.
- **Exécution Globale** : Lancez vos algorithmes depuis n'importe quel dossier sur votre ordinateur grâce à la commande `algo`.

---

## 🛠️ Installation Requise avant de Commencer (Prérequis)

Pour que l'extension et la commande globale marchent, votre système a besoin de Node.js.
Si vous ne l'avez pas déjà :
1. Téléchargez et installez **Node.js** depuis [nodejs.org](https://nodejs.org/).
2. Pendant l'installation, laissez toutes les options par défaut (assurez-vous que l'ajout à la variable "PATH" est coché).

---

## 📥 1. Installation de la Commande Globale (CLI)

Une fois Node.js installé, vous devez récupérer le code source localement ou depuis ce dépôt et l'enregistrer dans votre système. 

Ouvrez l'Invite de Commande (`cmd`) ou PowerShell dans le dossier que vous venez de télécharger (là où se trouve ce fichier README) et tapez :

```bash
npm install -g .
```

**Vérification :**
Fermez le terminal, ouvrez-en un nouveau et tapez :
```bash
algo
```
Si un message d'usage apparaît (`Usage: node out/test-runner.js <file.algo>`), l'installation a réussi ! 
Vous pouvez maintenant exécuter n'importe quel fichier algorithme depuis n'importe quel dossier : `algo mon_programme.algo`

---

## 💻 2. Installation de l'Extension Visual Studio Code

L'extension vous fournit la coloration colorée, les snippets et le fameux bouton "Play" (ou touche **F5**) pour exécuter votre code directement depuis l'éditeur.

1. **Téléchargez** le fichier `algorithme-tn-0.1.0.vsix` fourni dans cette release / ce dépôt.
2. Ouvrez **Visual Studio Code**.
3. Allez dans l'onglet des **Extensions** (l'icône avec des carrés à gauche) ou tapez `Ctrl+Maj+X`.
4. Cliquez sur les **trois petits points `...`** en haut à droite du panneau des extensions.
5. Sélectionnez **Installer à partir d'un fichier VSIX...** (*Install from VSIX...*).
6. Cherchez et sélectionnez le fichier `algorithme-tn-0.1.0.vsix` que vous venez de télécharger.
7. (**Optionnel**) : Si VS Code vous le demande, cliquez sur "Recharger la fenêtre" (Reload Window).

---

## 📝 Comment l'utiliser ?

1. Créez un nouveau dossier pour vos exercices.
2. Créez un fichier finissant par **`.algo`** (ex: `exercice1.algo`).
3. Écrivez votre code en pseudo-code selon la convention (ex: `algorithme test\ndébut\nécrire("Bonjour le monde !")\nfin`).
4. **Appuyez sur `F5`** sur votre clavier, ou cliquez sur le bouton de Lancement en haut à droite. 
5. Le vrai Terminal VS Code s'ouvrira, vous demandera vos entrées `Saisir X: ` et affichera vos résultats !
