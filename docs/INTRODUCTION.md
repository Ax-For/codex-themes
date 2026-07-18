# Codex XP · QQ Theme 项目介绍

Codex XP · QQ Theme 是一套面向 Codex Desktop 的非官方完整界面主题。它不是代码高亮配色，也不是独立聊天客户端，而是在保留 Codex 原有任务、项目、工具和交互能力的前提下，将桌面工作区重新组织为 Windows XP 时代 QQ 聊天窗口的视觉结构。

项目只提供两种明确状态：

- **Windows XP · QQ**：启用完整 QQ 风格界面。
- **原生界面**：移除主题注入，回到 Codex 自带界面。

这种克制的双主题设计让安装、切换和恢复路径保持可理解，也便于作为公开项目继续维护。

## 设计目标

主题的重点不是简单地把界面涂成蓝色，而是还原经典 QQ 的信息结构：

- 左上角是账号资料区，头像、网名、签名和等级形成清晰层级。
- Codex / ChatGPT 模式切换与“换肤”位于独立工具区，不挤占账号信息。
- 新建任务、拉取请求、站点、已安排和插件组成 QQ 式横向功能栏。
- 项目成为可展开的联系人分组，会话成为带头像、状态和选中反馈的联系人条目。
- 主工作区以聊天窗口为核心，同时兼顾附件、代码变更、文件面板和终端等开发工作流。

## 主要功能

### QQ 风格账号资料

- 点击头像选择本地 PNG、JPEG 或 WebP 图片。
- 图片会在本机居中裁切为 128 × 128 WebP。
- 支持编辑网名 ID、QQ 签名和星级标识。
- 自定义头像和网名会同步用于用户消息，保持账号身份一致。

### 会话联系人列表

- 项目按 QQ 联系人分组展示，并显示会话数量。
- 会话使用双行信息：标题为主，任务状态为辅。
- 当前会话和运行中的任务使用浅蓝底、左侧状态轨与在线状态点。
- 非当前会话降低视觉权重，长标题自动截断，不破坏侧栏宽度。

### 原生能力安全代理

- Codex / ChatGPT 模式切换由主题创建的代理按钮触发。
- 原生 React 节点始终保留在原父节点中，避免模式切换时出现界面崩溃。
- 横向功能栏同样通过代理按钮调用原生操作，不改变 Codex 的业务逻辑。

### 开发工作区适配

- 统一聊天消息、附件卡片、资源卡片和审批区域的浅色层级。
- 为代码 Diff 提供可读的新增、删除和未修改配色。
- 文件浏览器、终端、输入区和欢迎页均有对应的 QQ 风格适配。
- 支持从主题菜单返回原生界面，不影响任务、项目和聊天记录。

## 主题切换与常驻

左上工具区的“换肤”菜单只显示：

1. `Windows XP · QQ`
2. `原生界面`

“皮肤常驻”开启后，下次启动 Codex 会继续应用主题；关闭后仅保留当前会话，下次启动恢复原生界面。状态由本机控制器确认，不使用只改变按钮外观的伪状态。

## 工作原理

项目通过 Codex Desktop 的本地 Chromium 调试接口，将经过约束的 CSS 和运行时脚本注入 `app://-` 主渲染器。

```text
安装脚本
  ↓
本机主题控制器（仅回环地址）
  ↓
验证 Codex 主渲染器
  ↓
注入 XP · QQ CSS 与受控交互代理
  ↓
换肤 / 常驻 / 恢复原生
```

主题不会修改 Codex 的 `app.asar`，也不会替换 Codex 的任务数据。Codex 更新 DOM 结构后，部分选择器可能需要随版本适配。

## 安全与隐私

- 控制服务只绑定本机回环地址。
- 控制请求使用每次安装生成的凭证。
- 只接受经过验证的 Codex `app://-` 主渲染器。
- 头像会校验扩展名、MIME、文件头、尺寸和大小，最大 8 MiB。
- 头像、资料和主题状态仅保存在当前机器。
- 不上传聊天内容，不包含统计或遥测代码。
- 恢复原生界面不会删除 Codex 任务、项目或聊天记录。

## 平台与安装入口

| 平台 | 安装 | 应用主题 | 恢复原生 |
|---|---|---|---|
| macOS | `studio/scripts/install.command` | `studio/scripts/apply.command` | `studio/scripts/restore.command` |
| Windows | `studio\scripts\windows\install.bat` | `studio\scripts\windows\apply.bat` | `studio\scripts\windows\restore.bat` |

运行要求与完整安装步骤请参阅根目录 [README](../README.md#安装)。

## 项目结构

```text
src/                         主题预览应用
e2e/                         浏览器端关键流程测试
theme-package/xp-qq/         公开主题素材和清单
studio/src/                  注入、控制与安全校验逻辑
studio/scripts/              macOS 安装和生命周期入口
studio/scripts/windows/      Windows 安装和生命周期入口
studio/themes/xp-qq/         XP · QQ 内置主题
artifacts/                   界面复核截图
```

## 验证与质量

项目包含三层验证：

- 预览应用单元测试与组件测试。
- Studio 注入、菜单、头像、资料和模式代理测试。
- Playwright 桌面端关键流程测试。

开发者可以运行：

```bash
npm install
npm run check
npm run test:coverage
npm run test:e2e
```

## 项目边界

- 这是完整界面皮肤，不是 `.tmTheme` 代码高亮主题。
- 主题只针对 Codex Desktop，不适用于 VS Code、Codex CLI 或 ChatGPT 网页版。
- 项目不提供第三方主题商店，也不保留其他内置皮肤。
- Codex Desktop 更新可能改变界面结构；遇到兼容问题时需要更新注入选择器。

## 免责声明

本项目与 OpenAI、Tencent QQ 或 Microsoft 无隶属关系。Codex、ChatGPT、QQ、Windows 及相关名称和商标归各自权利人所有。

项目以 [MIT License](../LICENSE) 开源。
