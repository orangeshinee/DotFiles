#!/usr/bin/env bash

# 如果脚本由 Karabiner 调用，需要显式设置 PATH
export PATH="/opt/homebrew/bin:$PATH"

# 脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 上级目录
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
# 日志目录和文件
LOG_DIR="$PARENT_DIR/log"
LOG_FILE="$LOG_DIR/upload.log"
ROTATED_LOG="$LOG_DIR/upload.log.1"
MAX_SIZE=$((5 * 1024 * 1024))  # 5 MB

mkdir -p "$LOG_DIR"

# 日志旋转：若超过 MAX_SIZE，则重命名并在新日志中写入提示
if [[ -f "$LOG_FILE" && $(stat -f%z "$LOG_FILE") -ge $MAX_SIZE ]]; then
  mv "$LOG_FILE" "$ROTATED_LOG"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 日志已旋转为 upload.log.1" > "$LOG_FILE"
fi

# 记录开始
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始上传流程" >> "$LOG_FILE"

# 运行 picgo，并捕获所有输出（stdout + stderr）
OUTPUT="$(picgo u 2>&1)"

# 写入原始输出到日志
echo "----- PicGo 原始输出 -----" >> "$LOG_FILE"
echo "$OUTPUT" >> "$LOG_FILE"
echo "--------------------------" >> "$LOG_FILE"

# 提取 URL
URL="$(echo "$OUTPUT" | grep -Eo 'https?://[^ ]+' | tail -n1)"

if [[ -n "$URL" ]]; then
  # 上传成功：记录、复制链接并通知
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 上传成功：$URL" >> "$LOG_FILE"
printf "%s" "$URL" | pbcopy
osascript -e "display notification \"$URL\" with title \"PicGo 上传成功\""
echo "$URL"
  exit 0
else
  # 上传失败：提取错误信息并记录、通知
  ERR="$(echo "$OUTPUT" | sed -n 's/.*\[PicGo ERROR\]: *//p' | head -n1)"
  [[ -z "$ERR" ]] && ERR="剪贴板无图片或上传失败"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 上传失败：$ERR" >> "$LOG_FILE"
  osascript -e "display notification \"$ERR\" with title \"PicGo 上传失败\""
  exit 1
fi
