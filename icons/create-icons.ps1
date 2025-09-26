# Script PowerShell pour créer des icônes temporaires de base
Add-Type -AssemblyName System.Drawing

# Fonction pour créer une icône simple
function Create-SimpleIcon {
    param($size, $filename)
    
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Couleur de fond dégradé simulé
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(102, 126, 234))
    $graphics.FillEllipse($brush, 2, 2, $size-4, $size-4)
    
    # Texte centré "MC" pour Mini Chat
    $font = New-Object System.Drawing.Font("Arial", [math]::Floor($size/4), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $text = "MC"
    $textSize = $graphics.MeasureString($text, $font)
    $x = ($size - $textSize.Width) / 2
    $y = ($size - $textSize.Height) / 2
    $graphics.DrawString($text, $font, $textBrush, $x, $y)
    
    # Sauvegarder
    $bitmap.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Nettoyer
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
}

# Créer les 4 tailles d'icônes
Create-SimpleIcon 16 "icon16.png"
Create-SimpleIcon 32 "icon32.png" 
Create-SimpleIcon 48 "icon48.png"
Create-SimpleIcon 128 "icon128.png"

Write-Host "Icônes créées avec succès !" -ForegroundColor Green