#!/usr/bin/env bash
# ============================================================
# 墨排 · 全自动上线脚本
# 用法： GITHUB_TOKEN=ghp_xxxx ./deploy/auto-deploy.sh
# 你只需做两件事：注册 GitHub 账号 → 生成 token 粘贴给 Kimi
# 其余全部自动：建仓库 → 推代码 → 开 Pages → 输出正式链接
# ============================================================
set -euo pipefail

TOKEN="${GITHUB_TOKEN:?请先设置 GITHUB_TOKEN}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="md2wechat"

echo "==> 1/5 获取 GitHub 用户名"
USER=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.github.com/user | grep -o '"login": *"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$USER" ] && { echo "❌ token 无效或权限不足"; exit 1; }
echo "    账号：$USER"

echo "==> 2/5 创建仓库 $REPO"
curl -s -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"$REPO\",\"private\":false,\"description\":\"墨排 · Markdown 转公众号排版工具\"}" \
  https://api.github.com/user/repos | grep -qE "201|422" \
  && echo "    仓库已就绪" || { echo "❌ 创建仓库失败"; exit 1; }

echo "==> 3/5 推送代码"
cd "$ROOT"
if [ ! -d .git ]; then git init -q; fi
git checkout -B main -q
git add index.html landing.html renderer.js app.js server.js package.json README.md \
  promo deploy robots.txt sitemap.xml chrome-ext 2>/dev/null || git add -A
git commit -q -m "v0.1 墨排 MVP" || echo "    （无新改动，跳过提交）"
git remote remove origin 2>/dev/null || true
git remote add origin "https://${TOKEN}@github.com/${USER}/${REPO}.git"
git push -u origin main -q --force
echo "    代码已推送"

echo "==> 4/5 开启 GitHub Pages"
sleep 3
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${USER}/${REPO}/pages" \
  -d '{"source":{"branch":"main","path":"/"}}' | grep -q "html_url" \
  && echo "    Pages 已开启" || echo "    Pages 可能已开启（重复调用为正常）"

echo "==> 5/5 完成"
echo ""
echo "🎉 上线成功！1–3 分钟后访问："
echo "    https://${USER}.github.io/${REPO}/"
echo ""
echo "下一步：把 V2EX 帖里的链接换成这个地址，即可发帖冷启动。"
