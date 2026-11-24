# PowerShell script to rename occurrences of devcelio or celio to pabllo and adjust theme colors

$projectPath = 'C:\Users\pabllo\OneDrive\Documentos\Site Pabllo'

# Define replacements
$replacements = @(
    @{Pattern='devcelio'; Replacement='pabllo'}
    @{Pattern='Celio';    Replacement='Pabllo'}
    @{Pattern='celio';    Replacement='pabllo'}
)

# Function to replace content in files
function Replace-Content {
    param($file)
    $text = Get-Content $file -Raw
    $newText = $text
    foreach ($r in $replacements) {
        $newText = $newText -replace $r.Pattern, $r.Replacement
    }
    if ($newText -ne $text) {
        Set-Content $file -Value $newText -Encoding utf8
        Write-Host "Updated content in $file"
    }
}

# Replace in all text files (html, css, js, json, md, etc.)
Get-ChildItem -Path $projectPath -Recurse -Include *.html,*.css,*.js,*.json,*.md,*.txt | ForEach-Object { Replace-Content $_ }

# Rename files that contain 'celio' or 'devcelio' in the name
Get-ChildItem -Path $projectPath -Recurse -File | Where-Object { $_.Name -match '(celio|devcelio)' } | ForEach-Object {
    $newName = $_.Name -replace 'devcelio', 'pabllo' -replace 'celio', 'pabllo'
    $newPath = Join-Path $_.DirectoryName $newName
    Rename-Item -Path $_.FullName -NewName $newName
    Write-Host "Renamed $($_.FullName) to $newPath"
}

# Adjust theme colors in CSS (root variables) for a Linux-like theme (dark/green)
# We'll modify the style tag in index.html directly
$indexPath = Join-Path $projectPath 'index.html'
$indexContent = Get-Content $indexPath -Raw
# Replace specific color variables (example replacements)
$indexContent = $indexContent -replace '--cor-fundo-escuro:#1f58b8', '--cor-fundo-escuro:#0e1117'
$indexContent = $indexContent -replace '--cor-fundo:#3f86e0', '--cor-fundo:#2e3436'
$indexContent = $indexContent -replace '--cor-fundo-claro:#8cc4f6', '--cor-fundo-claro:#4e9a06'
$indexContent = $indexContent -replace '--cor-janela:#ececec', '--cor-janela:#2e3436'
$indexContent = $indexContent -replace '--cor-listra-clara:#f6f6f6', '--cor-listra-clara:#555753'
$indexContent = $indexContent -replace '--cor-listra-escura:#e9e9e9', '--cor-listra-escura:#3c3c3c'
# Write back index.html
Set-Content $indexPath -Value $indexContent -Encoding utf8
Write-Host "Updated theme colors in index.html"
