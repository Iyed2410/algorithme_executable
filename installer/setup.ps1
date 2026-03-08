# PowerShell Installer for Algo-TN
# Runs with Administrator privileges to update system PATH

Write-Host "--- Installation de Algorithme-TN ---" -ForegroundColor Cyan

# Define install directory
$InstallDir = "C:\Program Files\Algorithme-TN"

# Create directory if it doesn't exist
if (-not (Test-Path $InstallDir)) {
    Write-Host "Création du dossier d'installation..."
    New-Item -ItemType Directory -Path $InstallDir -Force
}

# Copy files
Write-Host "Copie des fichiers..."
Copy-Item -Path "algo.exe", "algorithme-tn-0.1.0.vsix" -Destination $InstallDir -Force

# Add to PATH (System level)
Write-Host "Mise à jour de la variable d'environement PATH..."
$CurrentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($CurrentPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable("Path", $CurrentPath + ";$InstallDir", "Machine")
    Write-Host "PATH mis à jour. Redémarrez votre terminal pour utiliser 'algo'." -ForegroundColor Green
} else {
    Write-Host "Le dossier est déjà dans le PATH." -ForegroundColor Yellow
}

# Install VS Code Extension
if (Get-Command "code" -ErrorAction SilentlyContinue) {
    Write-Host "Installation de l'extension VS Code..."
    code --install-extension "$InstallDir\algorithme-tn-0.1.0.vsix"
} else {
    Write-Host "VS Code n'a pas été trouvé. Installez l'extension manuellement depuis : $InstallDir" -ForegroundColor Red
}

Write-Host "`nInstallation terminée avec succès !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant utiliser la commande 'algo' n'importe où."
pause
