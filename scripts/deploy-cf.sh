#!/usr/bin/env bash
# deploy-cf.sh — 一键构建并部署 darlynmae.com 到 Cloudflare Pages
#
# 用法（在 Git Bash 中，且已开启全局 TUN 代理）:
#   bash scripts/deploy-cf.sh
#
# 说明:
#   - 脚本本身不含任何明文密钥，Cloudflare token / account id 从本机
#     gitignore 的 CF_DEPLOY_SECRETS.md 中解析（该文件勿提交远程）。
#   - 仅做「构建 + 部署」。git push 请另行手动执行。
#   - 终端必须开全局 TUN 代理，否则 npm / wrangler 会被 ECONNRESET 重置。
set -euo pipefail

# 进入项目根目录（脚本所在目录的上一级）
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "▶ 项目目录: $ROOT"

# 从本地密钥文件读取 Cloudflare 凭证（兼容文件中混有说明文字）
SECRETS="CF_DEPLOY_SECRETS.md"
if [ ! -f "$SECRETS" ]; then
  echo "✗ 找不到 $SECRETS（应含 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID）"
  echo "  请确认本文件存在，或手动 export 两个变量后再跑 wrangler。"
  exit 1
fi

CLOUDFLARE_API_TOKEN="$(grep -m1 'CLOUDFLARE_API_TOKEN=' "$SECRETS" | sed -E 's/.*="([^"]+)".*/\1/' || true)"
CLOUDFLARE_ACCOUNT_ID="$(grep -m1 'CLOUDFLARE_ACCOUNT_ID=' "$SECRETS" | sed -E 's/.*="([^"]+)".*/\1/' || true)"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "✗ 未能从 $SECRETS 解析出 token / account id"
  exit 1
fi
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
echo "✓ 已载入 Cloudflare 凭证 (account ${CLOUDFLARE_ACCOUNT_ID:0:6}...)"

# 若 next 未安装，先补装
if [ ! -x ./node_modules/.bin/next ]; then
  echo "▶ next 未安装，运行 npm install ..."
  npm install
fi

# 1) 构建静态站点
echo "▶ [1/2] 构建静态站点 (STATIC_EXPORT=1 next build) ..."
STATIC_EXPORT=1 ./node_modules/.bin/next build

# 2) 部署到 Cloudflare Pages
echo "▶ [2/2] 部署 out/ 到 Cloudflare Pages (project: darlynmae) ..."
npx wrangler pages deploy out --project-name darlynmae

echo "✅ 部署完成。稍等 1-2 分钟，访问 https://darlynmae.com 验证切流。"
