# Codex XP · QQ Theme

一个非官方的 Codex Desktop 主题，把工作区改造成 Windows XP 时代的 QQ 聊天窗口，同时保留一键返回原生界面的能力。

想先了解设计目标、完整功能、实现方式与安全边界，可阅读[项目介绍](./docs/INTRODUCTION.md)。

公开版只提供两种外观状态：

- `Windows XP · QQ`：完整主题、QQ 风格会话区、自定义本地头像、文件面板与终端配色。
- `原生界面`：清除主题注入，恢复 Codex 自带界面。

不会安装或展示其他皮肤，也不提供自定义背景主题上传。

## 功能

- 在 Codex 内通过“换肤”菜单切换 XP · QQ / 原生界面。
- 保留 Codex / ChatGPT 原生模式切换控件。
- 点击左上角头像选择本地 PNG、JPEG 或 WebP 图片。
- 头像自动居中裁切为 128 × 128 WebP，仅保存在当前机器的 Codex 本地存储中。
- 可选择当前会话启用，或通过“皮肤常驻”在下次启动时继续启用。
- 附带原创 QQ 风格 Codex 宠物“蓝扣”，包含 9 种工作状态动画。
- 支持 macOS 与 Windows 的用户级安装和恢复入口。

## 安装

要求：

- 已安装官方 Codex Desktop。
- Node.js 22 或更高版本；若系统没有，安装器会优先使用官方 Codex 应用内附带的 Node.js。
- macOS 安装器会验证 Codex 应用签名与 OpenAI Team ID。

### macOS

在 Finder 中双击：

```text
studio/scripts/install.command
```

也可以在终端运行：

```bash
open studio/scripts/install.command
```

### Windows

双击：

```text
studio\scripts\windows\install.bat
```

安装完成后会创建当前用户范围内的启动入口，并应用 `xp-qq` 主题。

## 使用与恢复

- 在 Codex 顶部点击“换肤”，选择“Windows XP · QQ”或“原生界面”。
- 点击左上角头像可更换本地头像。
- macOS 手动启用：`studio/scripts/apply.command`
- macOS 恢复原生：`studio/scripts/restore.command`
- Windows 手动启用：`studio\scripts\windows\apply.bat`
- Windows 恢复原生：`studio\scripts\windows\restore.bat`

恢复原生只清除当前主题注入，不会删除你的 Codex 任务、项目或聊天记录。

## QQ 宠物

仓库内置原创企鹅伙伴“蓝扣”：冰蓝耳机、橙色围巾和浅蓝信使包呼应 XP · QQ 主题，但不使用 QQ 标志或官方角色素材。宠物包位于 `pets/lan-kou/`，覆盖待机、左右移动、挥手、跳跃、失败、等待输入、工作中和待审查等状态。

安装到当前用户的 Codex 宠物目录：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/pets"
cp -R pets/lan-kou "${CODEX_HOME:-$HOME/.codex}/pets/lan-kou"
```

安装后重新打开 Codex，即可在宠物选择中使用“蓝扣”。逐帧总览和校验结果保存在 `pets/lan-kou/qa/`。

## 开发

预览站点：

```bash
npm install
npm run dev
```

完整检查：

```bash
npm run check
npm run test:e2e
```

目录说明：

```text
src/                    主题预览应用
theme-package/xp-qq/    XP · QQ 主题素材与清单
studio/                 可安装的 Codex 注入控制器
studio/themes/xp-qq/    公开版唯一内置主题
pets/lan-kou/           原创 QQ 风格 Codex 宠物与验收材料
```

## 安全与隐私

- 控制服务只绑定回环地址，并使用每次安装生成的控制凭证。
- 控制请求限制为受审核的 `app://-` Codex renderer 来源。
- 头像文件会同时校验扩展名、MIME、图片文件头、尺寸和大小，上限为 8 MiB。
- 不上传头像、主题或聊天内容，不包含统计或遥测代码。
- 安装与状态文件限制在当前用户目录。

## 兼容性

这个项目通过 Codex Desktop renderer 注入 CSS 和受控脚本实现主题，并未修改 Codex 产品源码。Codex 更新 DOM 结构后，个别样式可能需要跟进适配。

当前最新实测兼容版本：

- Codex Desktop `26.715.72359`
- macOS `26.5.2`（Apple Silicon）
- 验证日期：`2026-07-23`

这里的版本号表示“已经完成实际启动、常驻和注入验证的最新版本”，不是对未来 Codex 版本的永久兼容保证。Windows 安装入口和控制器测试仍受支持，但上述桌面版本的实机验证环境为 macOS。

如果另一台机器在相同 Codex 版本下仍然加载失败，请阅读[安装与启动故障排查](./docs/TROUBLESHOOTING.md)。仅下载或更新 Git 仓库不会自动更新 `~/.codex/codex-themes` 中的已安装运行时，也不会替另一台机器创建本地状态和后台启动服务。

本项目与 OpenAI、Tencent QQ 或 Microsoft 无隶属关系。Codex、QQ、Windows 等名称和商标归各自权利人所有。

## License

[MIT](./LICENSE)
