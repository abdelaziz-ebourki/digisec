import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/** Browser service worker used in prototype mode (VITE_MOCK_API=true). */
export const worker = setupWorker(...handlers)
