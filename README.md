# Codex XP · QQ Theme

一个非官方的 Codex Desktop 主题，把工作区改造成 Windows XP 时代的 QQ 聊天窗口，同时保留一键返回原生界面的能力。

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
```

## 安全与隐私

- 控制服务只绑定回环地址，并使用每次安装生成的控制凭证。
- 控制请求限制为受审核的 `app://-` Codex renderer 来源。
- 头像文件会同时校验扩展名、MIME、图片文件头、尺寸和大小，上限为 8 MiB。
- 不上传头像、主题或聊天内容，不包含统计或遥测代码。
- 安装与状态文件限制在当前用户目录。

## 兼容性

这个项目通过 Codex Desktop renderer 注入 CSS 和受控脚本实现主题，并未修改 Codex 产品源码。Codex 更新 DOM 结构后，个别样式可能需要跟进适配。

本项目与 OpenAI、Tencent QQ 或 Microsoft 无隶属关系。Codex、QQ、Windows 等名称和商标归各自权利人所有。

## License

[MIT](./LICENSE)
