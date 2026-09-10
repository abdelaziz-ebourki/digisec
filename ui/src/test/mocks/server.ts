import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export * from './handlers'

export const server = setupServer(...handlers)
