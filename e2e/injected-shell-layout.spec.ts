import { expect, test } from '@playwright/test'

import { buildSkinCss } from '../studio/src/skin-css.mjs'

const skinCss = buildSkinCss({
  theme: { id: 'xp-qq', colors: {} },
  heroDataUrl: 'data:image/png;base64,AA==',
})

async function mountCodexShell(page: import('@playwright/test').Page) {
  await page.setContent(`
    <!doctype html>
    <html data-codex-window-type="electron" data-codex-themes-skin="xp-qq">
      <head>
        <style>
          * { box-sizing: border-box; }
          html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
          main.main-surface { position: relative; width: 100%; height: 100%; }
          main.main-surface > header { height: 46px; }
          main.main-surface > header + div { height: calc(100% - 46px); }
          .conversation-fixture { background: #f5f7f9; }
          aside { position: absolute; z-index: 26; top: 46px; right: 0; bottom: 0; width: 316px; }
          aside > .isolate { width: 100%; height: 100%; }
          [role="tabpanel"] { height: calc(100% - 38px); }
        </style>
        <style>${skinCss}</style>
      </head>
      <body>
        <main class="main-surface" data-testid="main-surface">
          <header></header>
          <div class="conversation-fixture"></div>
          <aside data-testid="right-panel">
            <div class="isolate">
              <div class="h-toolbar">环境信息</div>
              <div role="tabpanel" data-app-shell-tab-panel-controller="right" data-tab-id="environment">面板</div>
            </div>
          </aside>
        </main>
      </body>
    </html>
  `)
}

async function shellGeometry(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const main = document.querySelector('main.main-surface') as HTMLElement
    const panel = document.querySelector('[data-testid="right-panel"]') as HTMLElement
    const mainRect = main.getBoundingClientRect()
    const panelRect = panel.getBoundingClientRect()
    const contactHeader = getComputedStyle(main, '::before')

    return {
      viewportWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      mainLeft: mainRect.left,
      mainRight: mainRect.right,
      panelLeft: panelRect.left,
      panelRight: panelRect.right,
      headerLeft: Number.parseFloat(contactHeader.left),
      headerRight: Number.parseFloat(contactHeader.right),
      headerTop: Number.parseFloat(contactHeader.top),
      headerHeight: Number.parseFloat(contactHeader.height),
    }
  })
}

test('XP QQ contact header stays continuous while the right panel is open and the window resizes', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await mountCodexShell(page)

  const wide = await shellGeometry(page)
  expect(wide).toMatchObject({
    viewportWidth: 1440,
    scrollWidth: 1440,
    mainLeft: 0,
    mainRight: 1440,
    panelLeft: 1124,
    panelRight: 1440,
    headerLeft: 0,
    headerRight: 0,
    headerTop: 46,
    headerHeight: 62,
  })
  await page.screenshot({ path: testInfo.outputPath('xp-qq-shell-1440.png') })

  await page.setViewportSize({ width: 1280, height: 720 })
  const medium = await shellGeometry(page)
  expect(medium).toMatchObject({
    viewportWidth: 1280,
    scrollWidth: 1280,
    mainRight: 1280,
    panelLeft: 964,
    panelRight: 1280,
    headerLeft: 0,
    headerRight: 0,
  })

  await page.setViewportSize({ width: 1100, height: 720 })
  const narrow = await shellGeometry(page)
  expect(narrow).toMatchObject({
    viewportWidth: 1100,
    scrollWidth: 1100,
    mainRight: 1100,
    panelLeft: 784,
    panelRight: 1100,
    headerLeft: 0,
    headerRight: 0,
  })
  await page.screenshot({ path: testInfo.outputPath('xp-qq-shell-1100.png') })
})

test('XP QQ separates compact process records from final answers without styling nested patch rows', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.setContent(`
    <!doctype html>
    <html data-codex-window-type="electron" data-codex-themes-skin="xp-qq">
      <head>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; background: #f5f7f9; }
          main { width: 860px; margin: 40px auto; }
          [data-user-message-bubble] { padding: 10px 14px; background: #dff1ff; }
        </style>
        <style>${skinCss}</style>
      </head>
      <body>
        <main>
          <div class="flex flex-col gap-[var(--conversation-item-gap,16px)]" data-testid="turn-wrapper">
            <div data-user-message-bubble>请继续处理这个任务</div>
            <div data-content-search-unit-key="process-1" data-testid="process-record">
              <p>我会先检查现有实现，再补充失败测试并完成验证。</p>
            </div>
            <div data-testid="tool-row">已读取文件</div>
            <div class="flex flex-col gap-[var(--conversation-patch-file-gap,var(--conversation-item-gap,16px))]" data-testid="patch-row">
              已编辑 skin-css.mjs +12 -4
            </div>
          </div>
          <article data-local-conversation-final-assistant data-testid="final-answer">
            <div data-content-search-unit-key="final-1"><p>修复已经完成，过程记录与最终回答现在有清晰层级。</p></div>
          </article>
        </main>
      </body>
    </html>
  `)

  const styles = await page.evaluate(() => {
    const style = (testId: string) => {
      const node = document.querySelector(`[data-testid="${testId}"]`) as HTMLElement
      const computed = getComputedStyle(node)
      return {
        background: computed.backgroundColor,
        borderLeftWidth: computed.borderLeftWidth,
        borderLeftColor: computed.borderLeftColor,
        paddingTop: computed.paddingTop,
        marginLeft: computed.marginLeft,
        boxShadow: computed.boxShadow,
      }
    }
    const process = document.querySelector('[data-testid="process-record"]') as HTMLElement
    const processText = process
    const processIcon = getComputedStyle(process, '::before')
    return {
      turnWrapper: style('turn-wrapper'),
      process: style('process-record'),
      patch: style('patch-row'),
      final: style('final-answer'),
      processText: {
        background: getComputedStyle(processText).backgroundColor,
        border: getComputedStyle(processText).borderTopColor,
        paddingTop: getComputedStyle(processText).paddingTop,
        fontSize: getComputedStyle(processText).fontSize,
        lineHeight: getComputedStyle(processText).lineHeight,
      },
      processIcon: {
        content: processIcon.content,
        width: processIcon.width,
        height: processIcon.height,
      },
    }
  })

  expect(styles.turnWrapper.background).toBe('rgba(0, 0, 0, 0)')
  expect(styles.turnWrapper.paddingTop).toBe('0px')
  expect(styles.process).toMatchObject({
    background: 'rgba(255, 255, 255, 0.72)',
    borderLeftWidth: '1px',
    borderLeftColor: 'rgb(215, 228, 237)',
    paddingTop: '7px',
    marginLeft: '28px',
  })
  expect(await page.locator('[data-testid="process-record"]').evaluate((node) => getComputedStyle(node).maxWidth)).toBe('720px')
  expect(styles.patch.background).toBe('rgba(0, 0, 0, 0)')
  expect(styles.patch.paddingTop).toBe('0px')
  expect(styles.final.background).toBe('rgb(255, 255, 255)')
  expect(styles.processText).toEqual({
    background: 'rgba(255, 255, 255, 0.72)',
    border: 'rgb(215, 228, 237)',
    paddingTop: '7px',
    fontSize: '13px',
    lineHeight: '21.45px',
  })
  expect(styles.processIcon).toEqual({ content: '"···"', width: '18px', height: '18px' })

  await page.screenshot({ path: testInfo.outputPath('xp-qq-process-record.png') })
})
