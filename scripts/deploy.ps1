# deploy.ps1 — 本机一键推送(带重试)。
# 沙箱无法直连 GitHub, 故该脚本在用户本机运行(非沙箱)。
# 用法:
#   powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1
# 或(已设执行策略后): .\scripts\deploy.ps1
param(
  [int]$MaxTries = 4,
  [int]$RetryDelay = 3
)
$ErrorActionPreference = 'Continue'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root
Write-Host "Repo: $root"

# 稳定 HTTPS 推送: 规避 GitHub 在 HTTP/2 下的 Connection reset
git config http.version HTTP/1.1
git config http.postBuffer 524288000
git config http.lowSpeedLimit 0
git config http.lowSpeedTime 999999

# 仅当本地领先远程时才推
$ahead = (git rev-list --count origin/main..HEAD 2>$null)
if ([string]::IsNullOrWhiteSpace($ahead) -or $ahead -eq '0') {
  Write-Host "本地已与 origin/main 同步, 无需推送。"
  exit 0
}
Write-Host "本地领先 $ahead 个提交, 开始推送..."

for ($i = 1; $i -le $MaxTries; $i++) {
  Write-Host "--- push attempt $i/$MaxTries ---"
  git push 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "PUSH OK"
    exit 0
  }
  Write-Host "attempt $i 失败, $RetryDelay 秒后重试..."
  Start-Sleep -Seconds $RetryDelay
}

Write-Host "PUSH FAILED — 建议改用 SSH(一次即可, 之后最稳):" -ForegroundColor Red
Write-Host "  git remote set-url origin git@github.com:v9hsrs8m7c-pixel/ai-project.git" -ForegroundColor Yellow
Write-Host "  并确认已生成并添加 SSH key 到 GitHub(ssh-keygen + 粘贴到 Settings->SSH keys)。" -ForegroundColor Yellow
exit 1
