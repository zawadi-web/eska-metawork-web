$manifestPath = "C:\Users\hp\Downloads\ESKA METAWORK WEB\ESKA METAWORK WEB\ESKA METAWORK WEB\data\gallery.json"

if (Test-Path $manifestPath) {
    $jsonContent = Get-Content $manifestPath -Raw
    $manifest = ConvertFrom-Json $jsonContent
    
    foreach ($img in $manifest.images) {
        if ($img.category -eq "structural") {
            if ($img.title -like "*gate*") {
                $img.category = "gates"
            } elseif ($img.title -like "*door*") {
                $img.category = "doors"
            } else {
                $img.category = "windows"
            }
        } elseif ($img.category -eq "welding") {
            $img.category = "custom"
        } elseif ($img.category -eq "general") {
            $img.category = "custom"
        }
    }
    
    $jsonOutput = ConvertTo-Json $manifest -Depth 100
    # Format json slightly to be readable
    $jsonOutput = $jsonOutput -replace '(?<=\[)\s+(?=\{)', ''
    $jsonOutput = $jsonOutput -replace '(?<=\})\s*,\s*(?=\{)', ",`r`n"
    Set-Content -Path $manifestPath -Value $jsonOutput -Encoding UTF8
    Write-Host "Successfully remapped legacy categories."
}
