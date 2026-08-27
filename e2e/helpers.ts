import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const apiLog = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.artifacts/api.log')

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@digisec.local`
}

const uniquePhone = (): string => `+2126${String(Date.now()).slice(-8)}`

const uniqueApoge = (prefix: string): string => `${prefix}${String(Date.now()).slice(-7)}`

export function registerPayload(prefix: string) {
  return {
    firstName: prefix.toUpperCase(),
    lastName: 'Tester',
    codeApoge: uniqueApoge('23'),
    email: uniqueEmail(prefix),
    phoneNumber: uniquePhone(),
    password: 'password123',
  }
}

export async function extractVerificationToken(email: string): Promise<string> {
  const deadline = Date.now() + 15_000
  const pattern = new RegExp(`Verification link for ${email}: \\S*token=([A-Za-z0-9_-]+)`)
  while (Date.now() < deadline) {
    if (fs.existsSync(apiLog)) {
      const content = fs.readFileSync(apiLog, 'utf-8')
      const match = content.match(pattern)
      if (match) return match[1]
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Verification link for ${email} not found in api log`)
}

export async function verifyViaApi(
  request: import('@playwright/test').APIRequestContext,
  token: string,
): Promise<void> {
  const response = await request.get('http://localhost:8080/api/v1/auth/verify', {
    params: { token },
  })
  if (!response.ok()) {
    throw new Error(`Verify failed: ${response.status()}`)
  }
}

export async function loginViaApi(
  request: import('@playwright/test').APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  const response = await request.post('http://localhost:8080/api/v1/auth/login', {
    data: { email, password },
  })
  if (!response.ok()) {
    throw new Error(`Login failed for ${email}: ${response.status()}`)
  }
  return (await response.json()).accessToken
}

export async function createPostViaApi(
  request: import('@playwright/test').APIRequestContext,
  token: string,
  title: string,
  content: string,
): Promise<number> {
  const response = await request.post('http://localhost:8080/api/v1/posts', {
    headers: { Authorization: `Bearer ${token}` },
    data: { title, content },
  })
  if (!response.ok()) {
    throw new Error(`Create post failed: ${response.status()}`)
  }
  return (await response.json()).id
}
