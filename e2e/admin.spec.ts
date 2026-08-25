import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { loginViaApi, extractVerificationToken, registerPayload, verifyViaApi } from './helpers'

const fixture = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/orange.png')

test.describe.serial('admin activities flows', () => {
  test('admin creates an activity with an image then deletes it', async ({ page, request }) => {
    const token = await loginViaApi(request, 'admin@digisec.local', 'ChangeMe123!')
    await page.addInitScript((jwt) => localStorage.setItem('digisec.token', jwt), token)

    const title = `Activité E2E ${Date.now()}`
    await page.goto('/activities')
    await expect(page.getByRole('button', { name: /nouvelle activité/i })).toBeVisible()

    await page.getByRole('button', { name: /nouvelle activité/i }).click()
    await page.getByLabel('Titre').fill(title)
    await page.getByRole('button', { name: /choisir la date/i }).click()
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    await page.getByRole('gridcell', { name: day }).first().getByRole('button').click()
    await page.keyboard.press('Escape')
    await page.getByLabel('Description').fill('Activité créée par la suite admin E2E.')
    await page.getByLabel(/image \(optionnelle\)/i).setInputFiles(fixture)
    await page.getByRole('button', { name: /^publier$/i }).click()
    await expect(page.getByText(title)).toBeVisible({ timeout: 10_000 })

    await page
      .getByRole('button', { name: new RegExp(`supprimer l'activité ${title}`, 'i') })
      .click()
    await page.getByRole('dialog').getByRole('button', { name: /^supprimer$/i }).click()
    await expect(page.getByText(title)).toHaveCount(0, { timeout: 10_000 })
  })

  test('non-admin does not see management controls', async ({ page, request }) => {
    const payload = registerPayload('plain')
    const email = payload.email
    await request.post('http://localhost:8080/api/v1/auth/register', {
      data: payload,
    })
    const verificationToken = await extractVerificationToken(email)
    await verifyViaApi(request, verificationToken)
    const token = await loginViaApi(request, email, payload.password)
    await page.addInitScript((jwt) => localStorage.setItem('digisec.token', jwt), token)

    await page.goto('/activities')
    await expect(page.getByRole('heading', { name: /nos activités/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nouvelle activité/i })).toBeHidden()
  })
})
