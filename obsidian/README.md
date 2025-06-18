# Obsidian Web Clipper 模板库

本文件夹用于存放 [Obsidian Web Clipper](https://obsidian.md/clipper) 插件的自定义模板，便于不同类型网页内容高效归档到 Obsidian 笔记库。每个 JSON 文件为一种网站或内容类型的解析模板，支持自动提取、格式化和归档信息。

## 目录结构
- `webcut-clipper.json`：通用网页剪藏模板，适用于大多数文章类网页。
- `youtube-clipper.json`：YouTube 视频专用模板，自动提取视频标题、频道、时长、描述等信息。
- `tweet-clipper.json`：X（原 Twitter）推文专用模板，支持推文内容、作者、嵌入媒体等结构化归档。

## 各模板说明

### 1. webcut-clipper.json
- **用途**：适用于大多数网页文章的内容归档。
- **主要字段**：
  - 标题：自动翻译英文标题为中文并简化。
  - 链接、作者、创建时间、摘要。
  - tags：基于 PARA 方法论自动推荐标签，详见模板内标签体系说明。
- **归档路径**：`97📦 WebCut/`

### 2. youtube-clipper.json
- **用途**：专为 YouTube 视频页面设计。
- **主要字段**：
  - 视频标题、频道、频道链接、视频时长、描述、缩略图、发布时间等。
  - tags：固定为 `source/web/youtube`。
- **归档路径**：`References/Youtube/`
- **触发规则**：`https://www.youtube.com/watch` 页面。

### 3. tweet-clipper.json
- **用途**：专为 X（Twitter）推文页面设计。
- **主要字段**：
  - 推文内容、作者、作者主页、发布时间、嵌入图片/视频、引用推文等。
  - tags：固定为 `source/web/twitter`。
- **归档路径**：`97📦 WebCut/`
- **触发规则**：`https://x.com/.../status/数字` 页面。

## 使用说明
1. 将所需模板文件复制到 Obsidian Web Clipper 插件的模板目录下。
2. 在插件设置中选择对应模板，或根据网页类型自动匹配。
3. 可根据实际需求自定义模板内容和字段。

---
如需扩展其他网站模板，可参考现有 JSON 文件结构进行自定义。