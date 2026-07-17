import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Codex Retro Chat', () => {
  it('renders the three-pane coding workspace', () => {
    render(<App />)

    expect(screen.getByRole('banner')).toHaveTextContent('Codex QQ')
    expect(screen.getByRole('navigation', { name: '会话列表' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveTextContent('Codex 助手')
    expect(screen.getByRole('complementary', { name: '任务详情' })).toHaveTextContent('任务进度')
  })

  it('filters and switches conversations', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('searchbox', { name: '搜索会话' }), '主题')
    expect(screen.getByRole('button', { name: /复古主题开发/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /首页重构/ })).not.toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: '搜索会话' }))
    await user.click(screen.getByRole('button', { name: /首页重构/ }))
    expect(screen.getByRole('main')).toHaveTextContent('首页重构')
  })

  it('sends a message and clears the composer', async () => {
    const user = userEvent.setup()
    render(<App />)

    const composer = screen.getByRole('textbox', { name: '给 Codex 发消息' })
    await user.type(composer, '把标题栏的蓝色再压深一点')
    await user.click(screen.getByRole('button', { name: '发送消息' }))

    expect(screen.getByRole('main')).toHaveTextContent('把标题栏的蓝色再压深一点')
    expect(composer).toHaveValue('')
  })

  it('does not send an empty message', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('button', { name: '发送消息' })).toBeDisabled()
    await user.type(screen.getByRole('textbox', { name: '给 Codex 发消息' }), '   ')
    expect(screen.getByRole('button', { name: '发送消息' })).toBeDisabled()
  })

  it('only offers native and XP QQ themes', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)

    const app = screen.getByTestId('retro-app')
    expect(app).toHaveAttribute('data-theme', 'xp-qq')

    await user.click(screen.getByRole('button', { name: '选择主题，当前为 Windows XP · QQ' }))
    const themeMenu = screen.getByRole('menu', { name: '选择主题' })
    expect(themeMenu).toBeInTheDocument()
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(2)
    expect(screen.queryByRole('menuitemradio', { name: /Windows 98/ })).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu', { name: '选择主题' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '选择主题，当前为 Windows XP · QQ' }))

    await user.click(screen.getByRole('menuitemradio', { name: /原生 Codex/ }))
    expect(app).toHaveAttribute('data-theme', 'native')
    expect(screen.queryByRole('menu', { name: '选择主题' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '选择主题，当前为 原生 Codex' })).toBeInTheDocument()
    expect(window.localStorage.getItem('codex-theme')).toBe('native')

    firstRender.unmount()
    render(<App />)
    expect(screen.getByTestId('retro-app')).toHaveAttribute('data-theme', 'native')

    expect(screen.getByRole('button', { name: '选择主题，当前为 原生 Codex' })).toBeInTheDocument()
  })

  it('ignores a removed legacy theme stored by an older release', () => {
    window.localStorage.setItem('codex-theme', 'win98')
    render(<App />)

    expect(screen.getByTestId('retro-app')).toHaveAttribute('data-theme', 'xp-qq')
  })

  it('supports keyboard sending and shows the empty search state', async () => {
    const user = userEvent.setup()
    render(<App />)

    const composer = screen.getByRole('textbox', { name: '给 Codex 发消息' })
    await user.type(composer, '用快捷键发送{Meta>}{Enter}{/Meta}')
    expect(screen.getByRole('main')).toHaveTextContent('用快捷键发送')

    await user.type(screen.getByRole('searchbox', { name: '搜索会话' }), '不存在的项目')
    expect(screen.getByText('没有找到会话')).toBeInTheDocument()
    expect(screen.getByText('换个关键词试试')).toBeInTheDocument()
  })

  it('shows ready and idle states when switching sessions', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /OpenClaw 网关/ }))
    expect(screen.getByRole('main')).toHaveTextContent('已完成')
    await user.click(screen.getByRole('button', { name: /v0.9 发布检查/ }))
    expect(screen.getByRole('main')).toHaveTextContent('等待中')
  })
})
