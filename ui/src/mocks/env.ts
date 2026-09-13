/**
 * Mock-API mode helpers.
 *
 * The deployed prototype has no backend: when `VITE_MOCK_API=true`, an MSW
 * service worker intercepts `/api/v1` calls in the browser and serves them
 * from an in-memory/localStorage database (`src/mocks/`). Any other build
 * (Docker, CI, future real-backend hosting) talks to the real backend.
 */
export function isMockApi(): boolean {
  return import.meta.env.VITE_MOCK_API === 'true'
}

/** localStorage flag set when the visitor ticks "don't show again". */
export const PROTOTYPE_MODAL_HIDE_KEY = 'digisec.hide-prototype-modal'

/** Custom event that re-opens the prototype disclosure modal. */
export const SHOW_PROTOTYPE_MODAL_EVENT = 'digisec:show-prototype-modal'

export function requestPrototypeModal() {
  window.dispatchEvent(new CustomEvent(SHOW_PROTOTYPE_MODAL_EVENT))
}
