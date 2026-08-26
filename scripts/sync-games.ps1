# sync-games.ps1 — 一键把 GitHub 开源游戏导入并上线(无需每次手动 push)。
# 在 Git Bash 运行:
#   powershell -ExecutionPolicy Bypass -File scripts/sync-games.ps1
# 流程: git pull(拿最新 CURATED) -> node 导入 -> tsc 校验 -> commit -> push(HTTP/1.1+重试)
# 想彻底自动: 把本脚本放进 Windows 任务计划程序, 每 10 分钟触发一次即可后台自动上线。
$ErrorActionPreference = "Continue"
$scriptDir = $PSScriptRoot
$proj = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $proj

$node = "C:\Users\Apple\.workbuddy\binaries\node\versions\22.22.2\node.exe"
if (-not (Test-Path $node)) { $node = "node" }
$tsc  = Join-Path $proj "node_modules/typescript/bin/tsc"

git config --global http.version HTTP/1.1

# 1) 拉取最新(沙箱可能已更新 CURATED 清单)
git pull --rebase 2>&1 | Out-Null

# 2) 导入游戏
& $node (Join-Path $proj "scripts/import-games.mjs")
if ($LASTEXITCODE -ne 0) { Write-Error "导入失败, 中止。"; exit 1 }

# 3) 类型校验(避免生成的数据让 Vercel 构建挂掉)
if (Test-Path $tsc) {
  & $node $tsc --noEmit
  if ($LASTEXITCODE -ne 0) { Write-Error "tsc 失败, 已中止 push(请检查生成的数据类型)。"; exit 1 }
}

# 4) 提交 + 推送(重试 4 次, 规避 HTTP/2 连接重置)
git add public/games src/data/sources/selfhosted/games-imported.ts
git commit -m "chore: import games from GitHub" 2>&1 | Out-Null
$ok = $false
for ($i = 1; $i -le 4; $i++) {
  git push 2>&1
  if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  Write-Host "push 失败, 重试 $i/4 ..."; Start-Sleep 3
}
if (-not $ok) { Write-Error "push 最终失败, 请手动处理。"; exit 1 }
Write-Host "OK: 已导入并推送上线。"
