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
