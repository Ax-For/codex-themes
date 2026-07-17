export type SessionStatus = 'working' | 'ready' | 'idle'

export type Session = {
  id: string
  title: string
  preview: string
  time: string
  status: SessionStatus
  unread?: number
  icon: string
  context: string
}

export type ChatMessage = {
  id: string
  sender: 'user' | 'assistant' | 'tool'
  author: string
  time: string
  content: string
  detail?: string
}

export const sessions: Session[] = [
  {
    id: 'retro-theme',
    title: '复古主题开发',
    preview: '正在调整 XP 风格的窗口细节',
    time: '23:06',
    status: 'working',
    unread: 2,
    icon: 'C',
    context: 'codex-themes',
  },
  {
    id: 'homepage',
    title: '首页重构',
    preview: '视觉层级已经完成第二轮检查',
    time: '22:41',
    status: 'ready',
    icon: 'H',
    context: 'studio-web',
  },
  {
    id: 'gateway',
    title: 'OpenClaw 网关',
    preview: '探针检查正常，服务已恢复',
    time: '21:18',
    status: 'ready',
    icon: 'O',
    context: 'local-tools',
  },
  {
    id: 'release',
    title: 'v0.9 发布检查',
    preview: '还有 3 项待确认',
    time: '昨天',
    status: 'idle',
    icon: 'V',
    context: 'session-observer',
  },
]

export const initialMessages: Record<string, ChatMessage[]> = {
  'retro-theme': [
    {
      id: 'retro-1',
      sender: 'user',
      author: '东亚飞',
      time: '22:58:12',
      content: '做一套 Windows XP 时代 QQ 聊天框风格的 Codex 界面。要像那个年代，但不能只是一张不能操作的皮肤。',
    },
    {
      id: 'retro-2',
      sender: 'assistant',
      author: 'Codex 助手',
      time: '22:59:04',
      content: '收到。我会保留老 QQ 的窗口结构、联系人列表和编辑器布局，把中间区域做成真正可工作的编程会话。',
    },
    {
      id: 'retro-3',
      sender: 'tool',
      author: '工具消息',
      time: '23:05:46',
      content: '已完成工作区检查',
      detail: '发现空仓库 · Node 24.13.0 · 准备创建 React/Vite 项目',
    },
    {
      id: 'retro-4',
      sender: 'assistant',
      author: 'Codex 助手',
      time: '23:06:21',
      content: '视觉骨架已经就位。接下来会完善主题切换、消息交互和窗口状态，让复古质感与日常可用性同时成立。',
    },
  ],
  homepage: [
    {
      id: 'home-1',
      sender: 'user',
      author: '东亚飞',
      time: '22:32:08',
      content: '首页看起来还是太像模板，把主操作再明确一点。',
    },
    {
      id: 'home-2',
      sender: 'assistant',
      author: 'Codex 助手',
      time: '22:40:51',
      content: '首页重构已完成：收紧了顶栏，把任务入口放到第一视觉层级，同时减少了重复卡片。',
    },
  ],
  gateway: [
    {
      id: 'gateway-1',
      sender: 'tool',
      author: '网关探针',
      time: '21:17:03',
      content: 'Gateway probe: healthy',
      detail: '127.0.0.1:18789 · HTTP 200 · listener active',
    },
    {
      id: 'gateway-2',
      sender: 'assistant',
      author: 'Codex 助手',
      time: '21:18:14',
      content: 'OpenClaw 网关已经恢复，延迟复查也通过了。',
    },
  ],
  release: [
    {
      id: 'release-1',
      sender: 'assistant',
      author: 'Codex 助手',
      time: '昨天 18:22',
      content: '发布清单还剩键盘导航、空状态和 Windows 打包签名三项。',
    },
  ],
}
