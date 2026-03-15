#!/bin/sh

set -e  # 任何命令失败立即退出（关键！）

PROJECT_NAME="vue-ts-admin"
TARGET_DIR="/opt/1panel/www/sites/vue-ts-admin/index"
DIST_DIR="./dist"

# === 日志函数 ===
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "开始部署项目: $PROJECT_NAME，版本: latest"

# === 步骤 2：拉取最新代码 ===
log "拉取分支最新代码..."
git fetch --all && git reset --hard origin/master
# 清理未跟踪文件（可选，确保干净构建）
log "清理未跟踪文件..."
git clean -fd

# === 步骤 3：yarn install ===
log "执行 pnpm install..."
if ! pnpm install; then
    log "错误：pnpm install 构建失败！"
    exit 1
fi

# === 步骤 4：pnpm build ===
log "执行 pnpm build..."
if ! pnpm build; then
    log "错误：pnpm build 构建失败！"
    exit 1
fi
if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR")" ]; then
    log "错误：构建产物目录 $DIST_DIR 不存在或为空！"
    exit 1
fi

# === 步骤 5：部署到 Web 目录 使用 ${TARGET_DIR:?} 防止展开为 ===
log "清空目标目录: $TARGET_DIR"
rm -rf "${TARGET_DIR:?}"/*

log "复制构建产物从 $DIST_DIR 到 $TARGET_DIR"
cp -r "${DIST_DIR:?}"/* "${TARGET_DIR:?}"/

# === 完成 ===
log "执行完成！项目 $PROJECT_NAME 版本 latest 已运行。"
log "网站地址: https://xxxxx.xxx"