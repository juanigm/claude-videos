# Render a composition to mp4 (h264, GPU via ANGLE), keeping Remotion's temporary bundles in one folder
# and cleaning them afterwards.
# usage: powershell -ExecutionPolicy Bypass -File scripts\render.ps1 <CompositionId> [out\file.mp4] [-Crf 18] [-Scale 1] [-Props props.json]
param(
    [Parameter(Mandatory = $true)][string]$Comp,
    [string]$Out,
    [int]$Crf = 18,
    [double]$Scale = 1,
    [string]$Props,
    [string]$Tmp = $(if ($env:REMOTION_TMP) { $env:REMOTION_TMP } else { 'C:\remotion-tmp' })
)
Set-Location (Split-Path -Parent $PSScriptRoot)
if (-not $Out) { $Out = "out\$Comp.mp4" }
New-Item -ItemType Directory -Force $Tmp | Out-Null
$env:TEMP = $Tmp; $env:TMP = $Tmp
$a = @('remotion', 'render', 'src/index.ts', $Comp, $Out, '--codec', 'h264', '--crf', "$Crf", '--gl=angle')
if ($Scale -ne 1) { $a += "--scale=$Scale" }
if ($Props) {
    # -Props takes a JSON FILE (the safe way: `powershell -File` strips the quotes of inline JSON).
    # Inline JSON only works when this script is called from inside a PowerShell session.
    if (Test-Path -LiteralPath $Props -PathType Leaf) { $pf = (Resolve-Path -LiteralPath $Props).Path }
    else {
        try { $null = $Props | ConvertFrom-Json -ErrorAction Stop }
        catch { Write-Output "ERROR: -Props is not a JSON file nor valid JSON: $Props . Write the props to a .json file and pass its path."; exit 2 }
        $pf = Join-Path $Tmp 'render-props.json'
        [IO.File]::WriteAllText($pf, $Props)
    }
    $a += "--props=$pf"
}
& npx @a
$code = $LASTEXITCODE
& (Join-Path $PSScriptRoot 'clean-remotion-tmp.ps1') -Root $Tmp
if ($code -eq 0) { Write-Output "OK -> $Out" }
exit $code
