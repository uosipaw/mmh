param(
  [string]$Path = "tarot-cards.json",
  [switch]$DryRun
)

if (-not (Test-Path $Path)) {
  Write-Error "File not found: $Path"
  exit 1
}

function Fix-Text($text) {
  if (-not $text) { return $text }
  $t = [string]$text
  # Normalize common mojibake from smart quotes
  # Sequences sometimes appear as replacement char + ?T*
  $t = $t -replace "\uFFFD\?Tve", "'ve"
  $t = $t -replace "\uFFFD\?Tre", "'re"
  $t = $t -replace "\uFFFD\?Ts", "'s"
  # Or any non-ASCII char before ?T*
  $t = $t -replace "[^\x00-\x7F]\?Tve", "'ve"
  $t = $t -replace "[^\x00-\x7F]\?Tre", "'re"
  $t = $t -replace "[^\x00-\x7F]\?Ts", "'s"
  # Lone patterns with ?T*
  $t = $t -replace "\?Tve", "'ve"
  $t = $t -replace "\?Tre", "'re"
  $t = $t -replace "\?Ts", "'s"
  # Fallback: replace any remaining replacement chars with apostrophe
  $t = $t -replace "\uFFFD", "'"
  # Handle UTF-8 right single quote (0xE2 0x80 0x99) mis-decoded as Windows-1252 (â€™)
  $utf8RightSingleQuoteAsWin1252 = [string]([char]0x00E2) + [string]([char]0x20AC) + [string]([char]0x2122)
  $t = $t -replace [Regex]::Escape($utf8RightSingleQuoteAsWin1252), "'"
  # Collapse whitespace
  $t = ($t -replace "\s+", ' ').Trim()
  return $t
}

function Ensure-Period($text) {
  if (-not $text) { return $text }
  $t = $text.Trim()
  if ($t -match "[\.!?]$") { return $t }
  return "$t."
}

$json = Get-Content -Raw -Path $Path | ConvertFrom-Json
if (-not $json) {
  Write-Error "Failed to parse JSON from $Path"
  exit 1
}

foreach ($card in $json) {
  if (-not $card.description) { $card | Add-Member -NotePropertyName description -NotePropertyValue (@{}) }
  $kw = @()
  if ($card.keywords -and $card.keywords.Count -gt 0) {
    $kw = @($card.keywords | ForEach-Object { [string]$_ } )
  }
  $kw0 = if ($kw.Count -ge 1) { $kw[0] } else { $null }
  $kw1 = if ($kw.Count -ge 2) { $kw[1] } else { $null }

  $up = Fix-Text $card.description.upright
  $rev = Fix-Text $card.description.reversed

  # Build intentional, thought-provoking addenda using keywords
  $invitation = $null
  if ($kw0) {
    $invitation = "Invitation: Choose one small, observable act that embodies $kw0 today. What would meaningful progress look like by tonight?"
  } else {
    $invitation = "Invitation: Choose one small, observable act that honors this card's energy today. What would meaningful progress look like by tonight?"
  }

  $courseCorrect = $null
  $focusKW = if ($kw1) { $kw1 } elseif ($kw0) { $kw0 } else { $null }
  if ($focusKW) {
    $courseCorrect = "Course-correct: Name the pattern around $focusKW that drains integrity. What boundary, truth, or pause would realign you now?"
  } else {
    $courseCorrect = "Course-correct: Name the pattern that drains integrity. What boundary, truth, or pause would realign you now?"
  }

  if ($up) {
    $up = Ensure-Period $up
    if (-not ($up -match "Invitation:")) { $up = "$up $invitation" }
  } else {
    $up = $invitation
  }

  if ($rev) {
    $rev = Ensure-Period $rev
    if (-not ($rev -match "Course-correct:")) { $rev = "$rev $courseCorrect" }
  } else {
    $rev = $courseCorrect
  }

  $card.description.upright = $up
  $card.description.reversed = $rev
}

if ($DryRun) {
  $json | ConvertTo-Json -Depth 10
} else {
  $json | ConvertTo-Json -Depth 10 | Out-File -Encoding UTF8 -FilePath $Path
  Write-Host "Updated $Path with enriched descriptions."
}
