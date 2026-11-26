# Placeholder voice with the Windows text-to-speech, to work on timing until the real voice take arrives.
# usage: powershell -ExecutionPolicy Bypass -File scripts\tts_placeholder.ps1 <name> [-Rate 2] [-Voice "Microsoft David Desktop"]
#   reads the first ``` block of shorts\<name>\SCRIPT.md, writes shorts\<name>\voice\voice.wav (48 kHz)
param([Parameter(Mandatory = $true)][string]$Episode, [int]$Rate = 2, [string]$Voice)
Set-Location (Split-Path -Parent $PSScriptRoot)
$md = Get-Content "shorts\$Episode\SCRIPT.md" -Raw -Encoding UTF8
$block = [regex]::Match($md, '(?s)```\r?\n(.*?)```').Groups[1].Value
$text = [regex]::Replace($block, '\[[^\]]*\]', '')
# all-caps emphasis words read better in lower case
$text = [regex]::Replace($text, '\b[A-Z]{3,}\b', { param($m) $m.Value.ToLower() })
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
if ($Voice) { $s.SelectVoice($Voice) }
else {
    # first installed Spanish voice, then English, else the system default
    $en = $s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'es-*' } | Select-Object -First 1
    if (-not $en) { $en = $s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'en-*' } | Select-Object -First 1 }
    if ($en) { $s.SelectVoice($en.VoiceInfo.Name) }
}
$s.Rate = $Rate
$p = New-Object System.Speech.Synthesis.PromptBuilder
foreach ($line in ($text -split "`n")) { $l = $line.Trim(); if ($l) { $p.AppendText($l); $p.AppendBreak([TimeSpan]::FromMilliseconds(200)) } }
New-Item -ItemType Directory -Force "shorts\$Episode\voice" | Out-Null
$tmp = Join-Path $env:TEMP "tts_$Episode.wav"
$s.SetOutputToWaveFile($tmp); $s.Speak($p); $s.Dispose()
ffmpeg -v error -y -i $tmp -af "apad=pad_dur=1.0" -ac 2 -ar 48000 "shorts\$Episode\voice\voice.wav"
ffprobe -v error -show_entries format=duration -of csv=p=0 "shorts\$Episode\voice\voice.wav"
