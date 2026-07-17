import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Bot,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileCode2,
  FolderOpen,
  Image,
  Maximize2,
  Menu,
  MessageSquarePlus,
  Minus,
  Paperclip,
  Play,
  Search,
  Send,
  Settings,
  Smile,
  Sparkles,
  Square,
  TerminalSquare,
  Users,
  Volume2,
  X,
} from 'lucide-react'
import { initialMessages, sessions, type ChatMessage } from './data'
import {
  DEFAULT_THEME,
  isThemeId,
  THEME_STORAGE_KEY,
  themeRegistry,
  type ThemeId,
} from './themes'
import './styles.css'

const taskSteps = [
  { label: '搭建界面骨架', state: 'done' },
  { label: '实现聊天交互', state: 'done' },
  { label: '视觉细节打磨', state: 'current' },
  { label: '浏览器检查', state: 'waiting' },
]

function App() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(storedTheme) ? storedTheme : DEFAULT_THEME
  })
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState(initialMessages)

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0]
  const activeMessages = messages[activeSessionId] ?? []
  const activeTheme = themeRegistry.find((item) => item.id === theme) ?? themeRegistry[0]

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
    if (!normalizedQuery) return sessions

    return sessions.filter((session) =>
      [session.title, session.preview, session.context].some((value) =>
        value.toLocaleLowerCase('zh-CN').includes(normalizedQuery),
      ),
    )
  }, [query])

  const sendMessage = () => {
    const content = draft.trim()
    if (!content) return

    const newMessage: ChatMessage = {
      id: `${activeSessionId}-${Date.now()}`,
      sender: 'user',
      author: '东亚飞',
      time: new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date()),
      content,
    }

    setMessages((current) => ({
      ...current,
      [activeSessionId]: [...(current[activeSessionId] ?? []), newMessage],
    }))
    setDraft('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    sendMessage()
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      sendMessage()
    }
  }

  const selectTheme = (themeId: ThemeId) => {
    setTheme(themeId)
    setThemeMenuOpen(false)
  }

  const handleThemeMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setThemeMenuOpen(false)
    }
  }

  return (
    <div className="retro-desktop" data-testid="retro-app" data-theme={theme}>
      <div className="desktop-grain" aria-hidden="true" />

      <div className="desktop-shortcuts" aria-hidden="true">
        <div className="desktop-shortcut">
          <span className="shortcut-icon"><FolderOpen size={28} /></span>
          <span>我的项目</span>
        </div>
        <div className="desktop-shortcut">
          <span className="shortcut-icon"><TerminalSquare size={28} /></span>
          <span>Codex CLI</span>
        </div>
      </div>

      <section className="app-window" aria-label={theme === 'native' ? 'Codex 本地工作台' : 'Codex QQ 复古聊天工作台'}>
        <header className="window-titlebar" role="banner">
          <div className="window-brand">
            <span className="brand-mark" aria-hidden="true">C</span>
            <div>
              <strong>{theme === 'native' ? 'Codex' : 'Codex QQ'}</strong>
              <span>{theme === 'native' ? ' · 本地工作台' : ' · 复古编程助手'}</span>
            </div>
          </div>
          <div className="window-caption-controls" aria-label="窗口控制">
            <button type="button" aria-label="最小化"><Minus size={14} strokeWidth={3} /></button>
            <button type="button" aria-label="最大化"><Square size={11} strokeWidth={2.6} /></button>
            <button type="button" className="close-button" aria-label="关闭"><X size={14} strokeWidth={3} /></button>
          </div>
        </header>

        <div className="menu-strip">
          <nav className="classic-menu" aria-label="应用菜单">
            <button type="button">文件(F)</button>
            <button type="button">编辑(E)</button>
            <button type="button">查看(V)</button>
            <button type="button">工具(T)</button>
            <button type="button">帮助(H)</button>
          </nav>
          <div className="connection-state"><span /> 本地代理已连接</div>
        </div>

        <div className="app-toolbar" aria-label="快捷工具栏">
          <button type="button"><MessageSquarePlus size={17} /><span>新会话</span></button>
          <button type="button"><FolderOpen size={17} /><span>打开项目</span></button>
          <button type="button"><TerminalSquare size={17} /><span>终端</span></button>
          <span className="toolbar-separator" />
          <button type="button"><Users size={17} /><span>代理</span></button>
          <button type="button"><Bell size={17} /><span>通知</span></button>
          <div className="toolbar-spacer" />
          <div className="theme-control" onKeyDown={handleThemeMenuKeyDown}>
            <button
              type="button"
              className="theme-switch"
              onClick={() => setThemeMenuOpen((open) => !open)}
              aria-label={`选择主题，当前为 ${activeTheme.label}`}
              aria-haspopup="menu"
              aria-expanded={themeMenuOpen}
            >
              <span className={`theme-swatch ${activeTheme.swatchClass}`} />
              {activeTheme.label}
              <ChevronDown size={13} className={themeMenuOpen ? 'chevron-open' : ''} />
            </button>
            {themeMenuOpen ? (
              <div className="theme-menu" role="menu" aria-label="选择主题">
                <div className="theme-menu-heading">
                  <strong>外观切换</strong>
                  <span>使用 XP · QQ 或返回 Codex 原生界面</span>
                </div>
                <div className="theme-options">
                  {themeRegistry.map((item) => (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={item.id === theme}
                      aria-label={`${item.label}，${item.description}`}
                      key={item.id}
                      onClick={() => selectTheme(item.id)}
                    >
                      <span className={`theme-preview ${item.swatchClass}`} aria-hidden="true" />
                      <span className="theme-option-copy">
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>
                      <span className="theme-check" aria-hidden="true">
                        {item.id === theme ? <Check size={14} /> : null}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="theme-menu-footer">
                  <span>{themeRegistry.length} 个选项</span>
                  <span>无其他内置皮肤</span>
                </div>
              </div>
            ) : null}
          </div>
          <button type="button" aria-label="设置"><Settings size={17} /></button>
        </div>

        <div className="workspace-grid">
          <nav className="session-pane" aria-label="会话列表">
            <div className="profile-card">
              <div className="profile-avatar" aria-hidden="true">
                <span className="avatar-antenna" />
                <span className="avatar-eye left" />
                <span className="avatar-eye right" />
                <span className="avatar-mouth" />
              </div>
              <div className="profile-copy">
                <div><strong>Dongyafei</strong><span className="online-dot" /></div>
                <p>正在和代码好好相处...</p>
              </div>
              <button type="button" aria-label="打开个人菜单"><ChevronDown size={15} /></button>
            </div>

            <div className="search-wrap">
              <Search size={14} aria-hidden="true" />
              <input
                type="search"
                aria-label="搜索会话"
                placeholder="搜索会话或项目"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className="search-shortcut">⌘K</span>
            </div>

            <div className="session-tabs" aria-label="会话筛选">
              <button type="button" className="active"><Bot size={15} />会话</button>
              <button type="button"><Users size={15} />代理</button>
              <button type="button"><FileCode2 size={15} />变更</button>
            </div>

            <div className="session-section-label">
              <span>最近会话</span>
              <span>{filteredSessions.length}</span>
            </div>

            <div className="session-list">
              {filteredSessions.length > 0 ? filteredSessions.map((session) => (
                <button
                  type="button"
                  key={session.id}
                  className={`session-item ${session.id === activeSessionId ? 'selected' : ''}`}
                  onClick={() => setActiveSessionId(session.id)}
                  aria-label={`${session.title}，${session.preview}`}
                >
                  <span className={`session-avatar avatar-${session.id}`}>{session.icon}</span>
                  <span className="session-copy">
                    <span className="session-title-row">
                      <strong>{session.title}</strong>
                      <time>{session.time}</time>
                    </span>
                    <span className="session-preview-row">
                      <span>{session.preview}</span>
                      {session.unread ? <em>{session.unread}</em> : null}
                    </span>
                  </span>
                </button>
              )) : (
                <div className="empty-sessions">
                  <Search size={24} />
                  <strong>没有找到会话</strong>
                  <span>换个关键词试试</span>
                </div>
              )}
            </div>

            <div className="session-footer">
              <button type="button"><Volume2 size={15} />声音开启</button>
              <span>4 个会话</span>
            </div>
          </nav>

          <main className="chat-pane">
            <div className="chat-header">
              <span className="chat-avatar"><Bot size={22} /></span>
              <div className="chat-identity">
                <div><h1>{activeSession.id === 'retro-theme' ? 'Codex 助手' : activeSession.title}</h1><span className={`status-pill status-${activeSession.status}`}>{activeSession.status === 'working' ? '正在工作' : activeSession.status === 'ready' ? '已完成' : '等待中'}</span></div>
                <p>{activeSession.context} <span>·</span> 本地工作区 <span>·</span> 上下文 38%</p>
              </div>
              <div className="chat-header-actions">
                <button type="button" aria-label="运行任务"><Play size={16} fill="currentColor" /></button>
                <button type="button" aria-label="展开会话"><Maximize2 size={16} /></button>
                <button type="button" aria-label="更多操作"><Menu size={17} /></button>
              </div>
            </div>

            <div className="message-log" aria-live="polite">
              <div className="conversation-date"><span>今天</span></div>
              {activeMessages.map((message) => (
                <article key={message.id} className={`message message-${message.sender}`}>
                  <div className="message-meta">
                    <span className="message-author-icon" aria-hidden="true">
                      {message.sender === 'user' ? 'D' : message.sender === 'tool' ? <TerminalSquare size={14} /> : <Bot size={14} />}
                    </span>
                    <strong>{message.author}</strong>
                    <time>{message.time}</time>
                    {message.sender === 'assistant' ? <span className="assistant-badge">AI</span> : null}
                  </div>
                  <div className="message-body">
                    <p>{message.content}</p>
                    {message.detail ? (
                      <div className="tool-detail"><Check size={14} /><code>{message.detail}</code><button type="button" aria-label="复制工具结果"><Copy size={13} /></button></div>
                    ) : null}
                  </div>
                </article>
              ))}
              <div className="typing-state"><span /><span /><span /> Codex 正在整理下一步</div>
            </div>

            <form className="composer" onSubmit={handleSubmit}>
              <div className="composer-tools" aria-label="消息工具">
                <button type="button" aria-label="添加附件"><Paperclip size={16} /></button>
                <button type="button" aria-label="添加代码"><Code2 size={16} /></button>
                <button type="button" aria-label="添加图片"><Image size={16} /></button>
                <button type="button" aria-label="添加表情"><Smile size={16} /></button>
                <span />
                <button type="button" className="model-picker"><Sparkles size={14} /> GPT-5.6 <ChevronDown size={12} /></button>
              </div>
              <textarea
                aria-label="给 Codex 发消息"
                placeholder="给 Codex 发消息，⌘ + Enter 发送"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
              />
              <div className="composer-footer">
                <span>本地模式 · 工作区访问已开启</span>
                <div>
                  <button type="button" className="secondary-action">关闭(C)</button>
                  <button type="submit" className="primary-action" disabled={!draft.trim()} aria-label="发送消息"><Send size={14} />发送(S)</button>
                </div>
              </div>
            </form>
          </main>

          <aside className="task-pane" aria-label="任务详情">
            <div className="task-pane-header">
              <div><span>任务详情</span><strong>#184</strong></div>
              <button type="button" aria-label="折叠任务详情"><X size={15} /></button>
            </div>

            <section className="task-summary">
              <div className="task-kicker"><span className="working-light" />正在执行</div>
              <h2>复刻 XP QQ 聊天界面</h2>
              <p>构建可交互的复古 Codex 工作台，并完成桌面端视觉检查。</p>
              <div className="progress-track"><span /></div>
              <div className="progress-copy"><span>任务进度</span><strong>68%</strong></div>
            </section>

            <section className="task-section">
              <div className="task-section-title"><span>执行步骤</span><span>2 / 4</span></div>
              <ol className="task-steps">
                {taskSteps.map((step) => (
                  <li key={step.label} className={step.state}>
                    <span>{step.state === 'done' ? <Check size={12} /> : null}</span>
                    <div><strong>{step.label}</strong><small>{step.state === 'done' ? '已完成' : step.state === 'current' ? '进行中' : '等待'}</small></div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="task-section changed-files">
              <div className="task-section-title"><span>文件变更</span><span className="positive">+638</span></div>
              <button type="button"><FileCode2 size={15} /><span><strong>App.tsx</strong><small>主工作区</small></span><em>+284</em></button>
              <button type="button"><FileCode2 size={15} /><span><strong>styles.css</strong><small>复古视觉系统</small></span><em>+331</em></button>
              <button type="button"><FileCode2 size={15} /><span><strong>App.test.tsx</strong><small>交互测试</small></span><em>+23</em></button>
            </section>

            <section className="agent-card">
              <div className="agent-card-avatar"><Bot size={22} /></div>
              <div><strong>Codex Assistant</strong><span><i /> 在线 · 已工作 8 分钟</span></div>
              <button type="button" aria-label="代理设置"><Settings size={15} /></button>
            </section>
          </aside>
        </div>

        <footer className="window-statusbar">
          <div><span className="status-online" /> 在线</div>
          <div>分支 <strong>main</strong></div>
          <div>文件 <strong>4</strong></div>
          <div className="statusbar-spacer" />
          <div>UTF-8</div>
          <div>Ln 128, Col 24</div>
          <div className="resize-grip" aria-hidden="true" />
        </footer>
      </section>

      <footer className="desktop-taskbar" aria-hidden="true">
        <div className="start-button"><span className="start-flag" />开始</div>
        <div className="taskbar-app active"><span className="mini-brand">C</span>Codex QQ</div>
        <div className="taskbar-tray"><Volume2 size={14} /><span>23:19</span></div>
      </footer>
    </div>
  )
}

export default App
