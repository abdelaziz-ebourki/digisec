import { expect, test } from '@playwright/test'

test.describe('public pages', () => {
  test('home renders hero, sections and carousel', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /digisec/i }).first()).toBeVisible()
    await expect(page.getByText('IMPACT')).toBeVisible()
    for (let image = 1; image <= 7; image += 1) {
      await expect(page.getByAltText(`Moment fort DIGISEC ${image}`)).toBeAttached()
    }
  })

  test('about renders missions and the full bureau', async ({ page }) => {
    await page.goto('/digisec')
    await expect(page.getByText('Digitalisation', { exact: true })).toBeVisible()
    await expect(page.getByText('KWTAR EL BEJJAJ')).toBeVisible()
    await expect(page.getByAltText('MERYEM BERRIMA')).toBeVisible()
  })

  test('activities page loads from the API', async ({ page }) => {
    await page.goto('/activities')
    await expect(page.getByRole('heading', { name: /nos activités/i })).toBeVisible()
    await expect(
      page.getByText(/aucune activité|atelier|hackathon/i).first(),
    ).toBeVisible()
  })

  test('forum page loads and offers login for posting', async ({ page }) => {
    await page.goto('/forum')
    await expect(page.getByRole('heading', { name: /forum de discussion/i })).toBeVisible()
  })

  test('navigation works between routes', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: /principale/i })
    await nav.getByRole('link', { name: 'ACTIVITÉS' }).click()
    await expect(page.getByRole('heading', { name: /nos activités/i })).toBeVisible()
    await nav.getByRole('link', { name: 'FORUM' }).click()
    await expect(page.getByRole('heading', { name: /forum de discussion/i })).toBeVisible()
  })
})
