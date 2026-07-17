import { expect, test } from '@playwright/test'

test('user can operate the retro coding chat', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('banner')).toContainText('Codex QQ')
  await page.getByRole('button', { name: /首页重构/ }).click()
  await expect(page.getByRole('main')).toContainText('首页重构')

  const composer = page.getByRole('textbox', { name: '给 Codex 发消息' })
  await composer.fill('检查这个页面的间距')
  await page.getByRole('button', { name: '发送消息' }).click()
  await expect(page.getByRole('main')).toContainText('检查这个页面的间距')
})

test('user can switch the visual system', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '选择主题，当前为 Windows XP · QQ' }).click()
  await expect(page.getByRole('menu', { name: '选择主题' })).toBeVisible()
  await page.getByRole('menuitemradio', { name: /原生 Codex/ }).click()
  await expect(page.getByTestId('retro-app')).toHaveAttribute('data-theme', 'native')

  await page.reload()
  await expect(page.getByTestId('retro-app')).toHaveAttribute('data-theme', 'native')

  await page.getByRole('button', { name: '选择主题，当前为 原生 Codex' }).click()
  await expect(page.getByRole('menuitemradio')).toHaveCount(2)
  await expect(page.getByRole('menuitemradio', { name: /Windows 98/ })).toHaveCount(0)
  await page.getByRole('menuitemradio', { name: /Windows XP · QQ/ }).click()
  await expect(page.getByTestId('retro-app')).toHaveAttribute('data-theme', 'xp-qq')
})
