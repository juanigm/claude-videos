# Deletes the temporary webpack bundles Remotion leaves in the temp folder
# (one copy of the project + public/ per render or still; they add up to many GB).
# scripts\render.ps1 runs it after each render; run it by hand after a batch of stills.
# Safe: while a Remotion process (render / still / studio) is running, only
# bundles older than 3 hours are removed, so a render in progress keeps its bundle.
param([string]$Root = $(if ($env:REMOTION_TMP) { $env:REMOTION_TMP } else { 'C:\remotion-tmp' }))

if (-not (Test-Path $Root)) { exit 0 }

$busy = @(Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'remotion' }).Count -gt 0
$minAge = if ($busy) { (Get-Date).AddHours(-3) } else { (Get-Date).AddMinutes(-2) }

$freed = 0; $n = 0
Get-ChildItem $Root -Directory -Filter 'remotion-webpack-bundle-*' -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $minAge } |
    ForEach-Object {
        $size = (Get-ChildItem $_.FullName -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
        try {
            Remove-Item $_.FullName -Recurse -Force -Confirm:$false -ErrorAction Stop
            $freed += $size; $n++
        } catch { }   # locked = still in use; try again next time
    }

if ($n -gt 0) { Write-Output ("clean-remotion-tmp: removed {0} bundles, {1:N1} GB" -f $n, ($freed / 1GB)) }
exit 0
