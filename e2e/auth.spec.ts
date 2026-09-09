import { expect, test } from '@playwright/test'
import {
  deleteUserByEmail,
  extractVerificationToken,
  registerPayload,
  uniqueEmail,
} from './helpers'

test.describe.serial('auth flows', () => {
  test('full loop: register, verify via emailed link, login, logout', async ({ page, request }) => {
    const payload = registerPayload('e2e')
    const email = payload.email

    await page.goto('/register')
    await page.getByLabel('Prénom').fill(payload.firstName)
    await page.getByLabel('Nom', { exact: true }).fill(payload.lastName)
    await page.getByLabel('Code apogée').fill(payload.codeApoge)
    await page.getByLabel('Adresse e-mail').fill(email)
    await page.getByLabel(/téléphone/i).fill(payload.phoneNumber)
    await page.getByLabel('Mot de passe').fill(payload.password)
    await page.getByRole('button', { name: /créer mon compte/i }).click()

    await expect(page.getByText(/vérifiez votre boîte mail/i)).toBeVisible({ timeout: 10_000 })

    const token = await extractVerificationToken(email)
    await page.goto(`/verify?token=${token}`)
    await expect(page.getByText('Compte vérifié !')).toBeVisible({ timeout: 10_000 })

    await page.getByRole('link', { name: /se connecter/i }).click()
    await page.getByLabel('Adresse e-mail').fill(email)
    await page.getByLabel('Mot de passe').fill(payload.password)
    await page.getByRole('button', { name: /se connecter/i }).click()

    await expect(page.getByRole('button', { name: 'E2E' })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'E2E' }).click()
    await page.getByRole('menuitem', { name: /déconnexion/i }).click()
    await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible()

    await deleteUserByEmail(request, email)
  })

  test('unverified account cannot log in', async ({ page, request }) => {
    const payload = registerPayload('lazy')
    const email = payload.email

    await page.goto('/register')
    await page.getByLabel('Prénom').fill(payload.firstName)
    await page.getByLabel('Nom', { exact: true }).fill(payload.lastName)
    await page.getByLabel('Code apogée').fill(payload.codeApoge)
    await page.getByLabel('Adresse e-mail').fill(email)
    await page.getByLabel(/téléphone/i).fill(payload.phoneNumber)
    await page.getByLabel('Mot de passe').fill(payload.password)
    await page.getByRole('button', { name: /créer mon compte/i }).click()
    await expect(page.getByText(/vérifiez votre boîte mail/i)).toBeVisible({ timeout: 10_000 })

    await page.goto('/login')
    await page.getByLabel('Adresse e-mail').fill(email)
    await page.getByLabel('Mot de passe').fill(payload.password)
    await page.getByRole('button', { name: /se connecter/i }).click()

    await expect(page.getByText(/veuillez vérifier votre adresse e-mail/i)).toBeVisible({ timeout: 10_000 })

    await deleteUserByEmail(request, email)
  })
})
