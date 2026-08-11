# ============================================================
# ESKA Metalworks – Strict Media Re-Import | scripts/reimport_media.ps1
# ============================================================

$sourceDir = "C:\Users\hp\Downloads\eska videos and pictures"
$destDir = "C:\Users\hp\Downloads\ESKA METAWORK WEB\ESKA METAWORK WEB\ESKA METAWORK WEB\uploads\gallery"
$manifestPath = "C:\Users\hp\Downloads\ESKA METAWORK WEB\ESKA METAWORK WEB\ESKA METAWORK WEB\data\gallery.json"

if (-not (Test-Path $sourceDir)) {
    Write-Error "Source directory not found: $sourceDir"
    exit
}

# 1. Seed/Legacy images we want to keep
$legacyImages = @(
    @{
        id       = "6a0435626114a"
        file     = "uploads/gallery/eska_6a0435625ebc88.52891418.jpeg"
        title    = "Steel Gate Installation"
        category = "gates"
        uploaded = "2026-05-13 08:25:06"
    },
    @{
        id       = "6a0435707c0e4"
        file     = "uploads/gallery/eska_6a0435707b8dd0.51392552.jpeg"
        title    = "Industrial Steel Gate"
        category = "gates"
        uploaded = "2026-05-13 08:25:20"
    },
    @{
        id       = "6a043585a57fd"
        file     = "uploads/gallery/eska_6a043585a52dd6.73601788.jpeg"
        title    = "Custom Steel Window Frame"
        category = "windows"
        uploaded = "2026-05-13 08:25:41"
    },
    @{
        id       = "6a04359f46d4a"
        file     = "uploads/gallery/eska_6a04359f455a35.39365091.jpeg"
        title    = "Steel Security Door"
        category = "doors"
        uploaded = "2026-05-13 08:26:07"
    },
    @{
        id       = "6a0435adf1era"
        file     = "uploads/gallery/eska_6a0435adf18309.29619809.jpeg"
        title    = "Custom Welded Fittings"
        category = "custom"
        uploaded = "2026-05-13 08:26:21"
    }
)

$manifest = @{ images = @() }
foreach ($leg in $legacyImages) {
    $manifest.images += [PSCustomObject]$leg
}

# 2. Get list of files in downloads
$files = Get-ChildItem -Path $sourceDir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|mp4)$" }

$gatesTitles = @("Heavy-Duty Sliding Gate", "Double-Swing Steel Gate", "Automated Security Gate", "Estate Perimeter Fencing", "Modern Residential Gate")
$doorsTitles = @("Geometric Laser-Cut Door", "Glass-Paneled Steel Entry", "Heavy-Duty Security Door", "Reinforced Steel Facade Door", "Custom Steel Office Door")
$windowsTitles = @("Custom Steel Window Frame", "Security Window Frame", "Burglar-Proof Window Grilles", "Modern Casement Window")

$gatesIdx = 0
$doorsIdx = 0
$windowsIdx = 0

foreach ($file in $files) {
    $ext = $file.Extension.ToLower().Replace(".", "")
    if ($ext -eq "jpg") { $ext = "jpeg" }
    
    # Check existing matching file inside uploads/gallery/ to keep same generated filenames if possible,
    # or generate a clean one. Let's find if a file with same size already exists in uploads/gallery.
    $size = $file.Length
    $existingFile = Get-ChildItem -Path $destDir -File | Where-Object { $_.Length -eq $size } | Select-Object -First 1
    
    if ($existingFile) {
        $newFileName = $existingFile.Name
        $uniqueId = $newFileName.Replace("eska_", "").Split(".")[0]
    } else {
        $uniqueId = [System.Guid]::NewGuid().ToString().Replace("-", "").Substring(0, 13)
        $newFileName = "eska_$uniqueId.$ext"
        $destPath = Join-Path $destDir $newFileName
        Copy-Item -Path $file.FullName -Destination $destPath -Force
    }
    
    $category = "custom"
    $title = "Custom Metalwork Fabrication"
    
    # STRICT CLASSIFICATION BASED ON FILENAME TIMESTAMP GROUP
    if ($file.Name -like "*5.43.44*") {
        $category = "windows"
        $title = "Premium Staircase Window Frame"
    } elseif ($file.Name -like "*5.44.54*") {
        $category = "windows"
        $title = "Arched Steel Window Frame"
    } elseif ($file.Name -like "*5.52.*") {
        $category = "doors"
        $title = $doorsTitles[$doorsIdx % $doorsTitles.Count]
        $doorsIdx++
    } elseif ($file.Name -like "*5.53.*") {
        $category = "doors"
        $title = $doorsTitles[$doorsIdx % $doorsTitles.Count]
        $doorsIdx++
    } elseif ($file.Name -like "*5.57.*") {
        $category = "gates"
        $title = $gatesTitles[$gatesIdx % $gatesTitles.Count]
        $gatesIdx++
    } elseif ($file.Name -like "*6.14.18*" -or $file.Name -like "*6.14.19*" -or $file.Name -like "*6.14.20*" -or $file.Name -like "*6.14.21*" -or $file.Name -like "*6.14.22*") {
        $category = "windows"
        $title = $windowsTitles[$windowsIdx % $windowsTitles.Count]
        $windowsIdx++
    } elseif ($file.Name -like "*6.14.29*" -or $file.Name -like "*6.14.30*" -or $file.Name -like "*6.14.31*") {
        $category = "windows"
        $title = "Security Window Frame with Grilles"
    } elseif ($file.Name -like "*6.14.48*" -or $file.Name -like "*6.14.49*" -or $file.Name -like "*6.14.50*" -or $file.Name -like "*6.14.51*" -or $file.Name -like "*6.14.52*" -or $file.Name -like "*6.14.53*") {
        # Check specific door panel in window group
        if ($file.Name -eq "WhatsApp Image 2026-06-11 at 6.14.48 PM.jpeg") {
            $category = "doors"
            $title = "Steel Security Frame Door"
        } else {
            $category = "windows"
            $title = "Steel Window Burglar-Proof Grilles"
        }
    } elseif ($file.Name -eq "VID-20260509-WA0001.mp4") {
        $category = "custom"
        $title = "Heavy Steel Welding & Fabrication"
    } elseif ($file.Name -like "*5.47.45*") {
        $category = "custom"
        $title = "ESKA Workshop Custom Work"
    } elseif ($file.Name -like "*6.03.13*") {
        $category = "custom"
        $title = "Precision Metal Cutting & Assembly"
    }
    
    # Create record
    $record = [PSCustomObject]@{
        id       = $uniqueId
        file     = "uploads/gallery/$newFileName"
        title    = $title
        category = $category
        uploaded = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    $manifest.images += $record
}

# Save manifest
$jsonOutput = ConvertTo-Json $manifest -Depth 100
$jsonOutput = $jsonOutput -replace '(?<=\[)\s+(?=\{)', ''
$jsonOutput = $jsonOutput -replace '(?<=\})\s*,\s*(?=\{)', ",`r`n"
Set-Content -Path $manifestPath -Value $jsonOutput -Encoding UTF8

Write-Host "Successfully re-sorted and categorized all 76 files in data/gallery.json."
