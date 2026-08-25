import { expect, test } from '@playwright/test'
import { extractVerificationToken, loginViaApi, registerPayload, verifyViaApi } from './helpers'

test.describe.serial('forum flows', () => {
  test('member creates a post, comments, then deletes it', async ({ page, request }) => {
    const payload = registerPayload('forum')
    const email = payload.email
    const title = `Sujet E2E ${Date.now()}`

    await page.goto('/register')
    await page.getByLabel('Prénom').fill(payload.firstName)
    await page.getByLabel('Nom', { exact: true }).fill(payload.lastName)
    await page.getByLabel('Code apogée').fill(payload.codeApoge)
    await page.getByLabel('Adresse e-mail').fill(email)
    await page.getByLabel(/téléphone/i).fill(payload.phoneNumber)
    await page.getByLabel('Mot de passe').fill(payload.password)
    await page.getByRole('button', { name: /créer mon compte/i }).click()
    await expect(page.getByText(/vérifiez votre boîte mail/i)).toBeVisible({ timeout: 10_000 })

    const verificationToken = await extractVerificationToken(email)
    await verifyViaApi(request, verificationToken)
    const token = await loginViaApi(request, email, 'password123')
    await page.evaluate((jwt) => localStorage.setItem('digisec.token', jwt), token)
    await page.reload()
    await page.goto('/forum')

    await page.getByRole('button', { name: /nouveau sujet/i }).click()
    await page.getByLabel('Titre').fill(title)
    await page.getByLabel('Contenu').fill('Contenu créé par la suite E2E.')
    await page.getByRole('button', { name: /^publier$/i }).click()
    await expect(page.getByRole('heading', { name: title })).toBeVisible({ timeout: 10_000 })

    await page
      .locator('[data-slot="card"]')
      .filter({ hasText: title })
      .getByRole('button', { name: /commentaires/i })
      .click()
    await page.getByLabel('Nouveau commentaire').fill('Commentaire E2E !')
    await page.getByRole('button', { name: /publier le commentaire/i }).click()
    await expect(page.getByText('Commentaire E2E !')).toBeVisible({ timeout: 10_000 })

    await page
      .locator('[data-slot="card"]')
      .filter({ hasText: title })
      .getByRole('button', { name: new RegExp(`supprimer le sujet ${title}`, 'i') })
      .click()
    await page.getByRole('dialog').getByRole('button', { name: /^supprimer$/i }).click()
    await expect(page.getByRole('heading', { name: title })).toHaveCount(0, { timeout: 10_000 })
  })

  test('visitor cannot see the composer', async ({ page }) => {
    await page.goto('/forum')
    await expect(page.getByRole('link', { name: /connectez-vous pour publier/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /nouveau sujet/i })).toBeHidden()
  })
})
