import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import {
  deleteUserByEmail,
  extractVerificationToken,
  loginViaApi,
  registerPayload,
  verifyViaApi,
} from './helpers'

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
    // react-day-picker v10 names day buttons with the full localized date
    // ("Today, lundi 7 septembre 2026" for the current day).
    const todayLabel = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    await page.getByRole('button', { name: todayLabel }).click()
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

    await deleteUserByEmail(request, email)
  })

  test('admin sees the administration dashboard', async ({ page, request }) => {
    const token = await loginViaApi(request, 'admin@digisec.local', 'ChangeMe123!')
    await page.addInitScript((jwt) => localStorage.setItem('digisec.token', jwt), token)

    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /panneau d'administration/i })).toBeVisible()
    await expect(page.getByText('Membres', { exact: true })).toBeVisible()
    await expect(page.getByText('admin@digisec.local')).toBeVisible()
    await expect(page.getByRole('link', { name: /administration/i }).first()).toBeVisible()
  })

  test('non-admin is redirected away from the administration dashboard', async ({
    page,
    request,
  }) => {
    const payload = registerPayload('plain')
    const email = payload.email
    await request.post('http://localhost:8080/api/v1/auth/register', {
      data: payload,
    })
    const verificationToken = await extractVerificationToken(email)
    await verifyViaApi(request, verificationToken)
    const token = await loginViaApi(request, email, payload.password)
    await page.addInitScript((jwt) => localStorage.setItem('digisec.token', jwt), token)

    await page.goto('/admin')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: /administration/i })).toBeHidden()

    await deleteUserByEmail(request, email)
  })

  test('admin edits an activity and a post from the dashboard', async ({ page, request }) => {
    const token = await loginViaApi(request, 'admin@digisec.local', 'ChangeMe123!')
    await page.addInitScript((jwt) => localStorage.setItem('digisec.token', jwt), token)

    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /panneau d'administration/i })).toBeVisible()

    const activityTitle = `Activité E2E ${Date.now()}`
    await page.goto('/activities')
    await page.getByRole('button', { name: /nouvelle activité/i }).click()
    await page.getByLabel('Titre').fill(activityTitle)
    const todayLabel = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    await page.getByRole('button', { name: /choisir la date/i }).click()
    await page.getByRole('button', { name: todayLabel }).click()
    await page.keyboard.press('Escape')
    await page.getByLabel('Description').fill('Activité créée par la suite admin E2E.')
    await page.getByRole('button', { name: /^publier$/i }).click()
    await expect(page.getByText(activityTitle)).toBeVisible({ timeout: 10_000 })

    await page.goto('/admin')
    await page
      .getByRole('button', { name: `Modifier l'activité ${activityTitle}` })
      .click()
    await expect(page.getByLabel('Titre')).toHaveValue(activityTitle)
    const updatedActivityTitle = `${activityTitle} (modifié)`
    await page.getByLabel('Titre').fill(updatedActivityTitle)
    await page.getByRole('button', { name: /^modifier$/i }).click()
    await expect(page.getByText(updatedActivityTitle)).toBeVisible({ timeout: 10_000 })

    await page
      .getByRole('button', { name: `supprimer l'activité ${updatedActivityTitle}` })
      .click()
    await page.getByRole('dialog').getByRole('button', { name: /^supprimer$/i }).click()
    await expect(page.getByText(updatedActivityTitle)).toHaveCount(0, { timeout: 10_000 })

    const postTitle = `Sujet E2E ${Date.now()}`
    await page.goto('/forum')
    await page.getByRole('button', { name: /nouveau sujet/i }).click()
    await page.getByLabel('Titre').fill(postTitle)
    await page.getByLabel('Contenu').fill('Contenu créé par la suite admin E2E.')
    await page.getByRole('button', { name: /^publier$/i }).click()
    await expect(page.getByText(postTitle)).toBeVisible({ timeout: 10_000 })

    await page.goto('/admin')
    await page
      .getByRole('button', { name: `Modifier le sujet ${postTitle}` })
      .click()
    await expect(page.getByLabel('Titre')).toHaveValue(postTitle)
    const updatedPostTitle = `${postTitle} (modifié)`
    await page.getByLabel('Titre').fill(updatedPostTitle)
    await page.getByRole('button', { name: /^modifier$/i }).click()
    await expect(page.getByText(updatedPostTitle)).toBeVisible({ timeout: 10_000 })

    await page
      .getByRole('button', { name: `supprimer le sujet ${updatedPostTitle}` })
      .click()
    await page.getByRole('dialog').getByRole('button', { name: /^supprimer$/i }).click()
    await expect(page.getByText(updatedPostTitle)).toHaveCount(0, { timeout: 10_000 })
  })

  test('admin deletes a member without content from the dashboard', async ({
    page,
    request,
  }) => {
    const payload = registerPayload('doomed')
    const email = payload.email
    await request.post('http://localhost:8080/api/v1/auth/register', {
      data: payload,
    })
    const verificationToken = await extractVerificationToken(email)
    await verifyViaApi(request, verificationToken)

    const token = await loginViaApi(request, 'admin@digisec.local', 'ChangeMe123!')
    await page.addInitScript((jwt) => localStorage.setItem('digisec.token', jwt), token)

    await page.goto('/admin')
    await expect(page.getByText(email)).toBeVisible({ timeout: 10_000 })
    await page
      .getByRole('button', { name: `Supprimer le membre ${payload.firstName} ${payload.lastName}` })
      .click()
    await page.getByRole('dialog').getByRole('button', { name: /^supprimer$/i }).click()
    await expect(page.getByText(email)).toHaveCount(0, { timeout: 10_000 })
  })
})
