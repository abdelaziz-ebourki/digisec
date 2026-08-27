import { expect, test } from '@playwright/test'

test.describe('visual regression', () => {
  test('hero light', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('img[src*="hero-shield"]')
    await expect(page).toHaveScreenshot('hero-light.png', {
      maxDiffPixelRatio: 0.02,
      mask: [page.locator('[aria-live="polite"]')],
    })
  })

  test('hero dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await page.waitForSelector('img[src*="hero-shield"]')
    await expect(page).toHaveScreenshot('hero-dark.png', {
      maxDiffPixelRatio: 0.02,
      mask: [page.locator('[aria-live="polite"]')],
    })
  })

  test('header transparent vs solid', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('header')
    await expect(page.locator('header')).toHaveScreenshot('header-transparent.png', {
      maxDiffPixelRatio: 0.02,
    })
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.waitForTimeout(300)
    await expect(page.locator('header')).toHaveScreenshot('header-solid.png', {
      maxDiffPixelRatio: 0.02,
    })
  })
})
