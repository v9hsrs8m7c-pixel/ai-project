# sync-games.ps1 - one-click import GitHub games and push to deploy.
# Run in Git Bash:
#   powershell -ExecutionPolicy Bypass -File scripts/sync-games.ps1
# Flow: git pull (latest CURATED) -> node import -> tsc check -> commit -> push (HTTP/1.1 + retry)
# For full automation: schedule this in Windows Task Scheduler every 10 min.
# NOTE: keep this file ASCII-only. PowerShell 5.1 on Chinese Windows reads .ps1 as GBK,
#       so non-ASCII (Chinese) literals break parsing. Node .mjs is always UTF-8, safe.
$ErrorActionPreference = "Continue"
$scriptDir = $PSScriptRoot
$proj = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $proj

$node = "C:\Users\Apple\.workbuddy\binaries\node\versions\22.22.2\node.exe"
if (-not (Test-Path $node)) { $node = "node" }
$tsc  = Join-Path $proj "node_modules/typescript/bin/tsc"

git config --global http.version HTTP/1.1

# 1) restore committed GAME DATA only (undo an aborted import run that deleted imported
#    dirs or blanked games-imported.ts). Scope to data paths so local script edits survive.
git checkout -- public/games src/data/sources/selfhosted/games-imported.ts 2>&1 | Out-Null
git pull --rebase 2>&1 | Out-Null

# 2) offline rebuild: regenerate games-imported.ts from local public/games using each
#    HTML <title> (no network needed). Drops readme/technical/template non-game pages.
& $node (Join-Path $proj "scripts/regen-imported.mjs")
if ($LASTEXITCODE -ne 0) { Write-Error "regen failed, abort."; exit 1 }

# 2b) SAFETY: never commit/push if rebuild produced 0 games (would wipe live site).
$outTs = Join-Path $proj "src/data/sources/selfhosted/games-imported.ts"
$slugs = 0
if (Test-Path $outTs) { $slugs = (Get-Content $outTs | Select-String -Pattern 'slug:' | Measure-Object).Count }
if ($slugs -lt 1) { Write-Error "rebuild produced 0 games, abort (would wipe live site). Check public/games."; exit 1 }
Write-Host "rebuilt $slugs game entries."

# 3) type check (avoid breaking Vercel build with bad generated data)
if (Test-Path $tsc) {
  & $node $tsc --noEmit
  if ($LASTEXITCODE -ne 0) { Write-Error "tsc failed, push aborted (check generated data types)."; exit 1 }
}

# 4) commit + push (retry 4x to survive HTTP/2 connection reset)
git add public/games src/data/sources/selfhosted/games-imported.ts scripts/regen-imported.mjs scripts/import-games.mjs scripts/sync-games.ps1
git commit -m "chore: import games from GitHub" 2>&1 | Out-Null
$ok = $false
for ($i = 1; $i -le 4; $i++) {
  git push 2>&1
  if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  Write-Host "push failed, retry $i/4 ..."; Start-Sleep 3
}
if (-not $ok) { Write-Error "push failed finally, handle manually."; exit 1 }
Write-Host "OK: games imported and pushed live."
