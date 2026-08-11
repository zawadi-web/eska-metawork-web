# ============================================================
# ESKA Metalworks – Media Import Script | scripts/import_media.ps1
# ============================================================

$sourceDir = "C:\Users\hp\Downloads\eska videos and pictures"
$destDir = "C:\Users\hp\Downloads\ESKA METAWORK WEB\ESKA METAWORK WEB\ESKA METAWORK WEB\uploads\gallery"
$manifestPath = "C:\Users\hp\Downloads\ESKA METAWORK WEB\ESKA METAWORK WEB\ESKA METAWORK WEB\data\gallery.json"

if (-not (Test-Path $sourceDir)) {
    Write-Error "Source directory not found: $sourceDir"
    exit
}

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

# Load existing manifest
if (Test-Path $manifestPath) {
    try {
        $jsonContent = Get-Content $manifestPath -Raw -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($jsonContent)) {
            $manifest = @{ images = @() }
        } else {
            $manifest = ConvertFrom-Json $jsonContent
            if (-not $manifest.images) {
                $manifest = @{ images = @() }
            }
        }
    } catch {
        Write-Warning "Could not parse existing manifest. Initializing new one."
        $manifest = @{ images = @() }
    }
} else {
    $manifest = @{ images = @() }
}

$categories = @("gates", "doors", "windows", "shades", "towers", "custom")
$titles = @{
    "gates" = @("Heavy-Duty Sliding Gate", "Double-Swing Steel Gate", "Automated Security Gate", "Estate Perimeter Fencing", "Modern Residential Gate")
    "doors" = @("Geometric Laser-Cut Door", "Glass-Paneled Steel Entry", "Heavy-Duty Security Door", "Reinforced Steel Facade Door", "Custom Steel Office Door")
    "windows" = @("Custom Steel Window Frame", "Security Window Frame", "Burglar-Proof Window Grilles", "Modern Casement Window")
    "shades" = @("Polycarbonate Carshade", "Modern Steel Pergola", "Cantilever Car Shelter", "Waterproof Canvas Parking Shade")
    "towers" = @("Elevated Water Tank Tower", "Structural Steel Tank Stand", "Reinforced Tank Support Stand")
    "custom" = @("Custom Balcony Railing", "Steel Staircase Handrail", "Decorative Steel Balustrade", "Precision Custom Metalwork")
}

$files = Get-ChildItem -Path $sourceDir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|mp4)$" }
Write-Host "Found $($files.Count) media files to process."

$catCounter = 0
$importCount = 0

foreach ($file in $files) {
    $ext = $file.Extension.ToLower().Replace(".", "")
    if ($ext -eq "jpg") { $ext = "jpeg" } # normalize to jpeg
    
    # Generate unique ID and filename (php uniqid style)
    $uniqueId = [System.Guid]::NewGuid().ToString().Replace("-", "").Substring(0, 13)
    $newFileName = "eska_$uniqueId.$ext"
    $destPath = Join-Path $destDir $newFileName
    
    # Categorization logic
    if ($file.Name -like "*5.43.44*") {
        # Specific request mapping: Stair window
        $category = "windows"
        $title = "Premium Staircase Window Frame"
    } elseif ($file.Name -like "*5.44.54*") {
        # Specific request mapping: Arched window
        $category = "windows"
        $title = "Arched Steel Window Frame"
    } else {
        # Round robin categorization to balance categories
        $category = $categories[$catCounter % $categories.Count]
        $titleList = $titles[$category]
        $title = $titleList[([random]::new()).Next(0, $titleList.Count)]
        $catCounter++
    }
    
    # Copy file
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    
    # Create record
    $record = [PSCustomObject]@{
        id       = $uniqueId
        file     = "uploads/gallery/$newFileName"
        title    = $title
        category = $category
        uploaded = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    $manifest.images += $record
    $importCount++
}

# Save manifest
$jsonOutput = ConvertTo-Json $manifest -Depth 100
# Format json slightly to be readable
$jsonOutput = $jsonOutput -replace '(?<=\[)\s+(?=\{)', ''
$jsonOutput = $jsonOutput -replace '(?<=\})\s*,\s*(?=\{)', ",`r`n"
Set-Content -Path $manifestPath -Value $jsonOutput -Encoding UTF8

Write-Host "Successfully copied and categorized $importCount files into data/gallery.json."
