import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const pages = [
  { path: '/', name: 'home' },
  { path: '/digisec', name: 'about' },
  { path: '/activities', name: 'activities' },
  { path: '/forum', name: 'forum' },
  { path: '/login', name: 'login' },
  { path: '/register', name: 'register' },
]

for (const { path, name } of pages) {
  test(`a11y — ${name} light has no serious violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude([['.embla__container']])
      .analyze()
    const serious = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })

  test(`a11y — ${name} dark has no serious violations`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const serious = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })
}

test('a11y — header transparent vs solid', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('header')
  let results = await new AxeBuilder({ page })
    .include('header')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([])

  await page.evaluate(() => window.scrollTo(0, 300))
  await page.waitForTimeout(300)
  results = await new AxeBuilder({ page })
    .include('header')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  expect(results.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? '')), JSON.stringify(results.violations, null, 2)).toEqual([])
})
