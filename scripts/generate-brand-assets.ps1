param(
  [string]$Source = "$PSScriptRoot\..\public\brand\nagy-logo-transparent.png",
  [string]$OutputDirectory = "$PSScriptRoot\..\public\icons"
)

Add-Type -AssemblyName System.Drawing

$resolvedSource = (Resolve-Path -LiteralPath $Source).Path
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

function New-BrandedIcon {
  param(
    [int]$Size,
    [string]$Name,
    [double]$LogoWidthRatio
  )

  $sourceImage = [System.Drawing.Image]::FromFile($resolvedSource)
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(9, 6, 5))
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    $targetWidth = [int]($Size * $LogoWidthRatio)
    $targetHeight = [int]($targetWidth * $sourceImage.Height / $sourceImage.Width)
    $x = [int](($Size - $targetWidth) / 2)
    $y = [int](($Size - $targetHeight) / 2)
    $graphics.DrawImage($sourceImage, $x, $y, $targetWidth, $targetHeight)

    $outputPath = Join-Path $resolvedOutput $Name
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
    $sourceImage.Dispose()
  }
}

New-BrandedIcon -Size 192 -Name 'icon-192.png' -LogoWidthRatio 0.82
New-BrandedIcon -Size 512 -Name 'icon-512.png' -LogoWidthRatio 0.82
New-BrandedIcon -Size 512 -Name 'icon-maskable-512.png' -LogoWidthRatio 0.64

Write-Output "Brand assets generated in $resolvedOutput"
