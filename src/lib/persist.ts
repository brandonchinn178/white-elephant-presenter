import { type PresenterState } from './state'

export const getPresenterState = (): PresenterState | null => {
  const state = window.localStorage.getItem('presenter-state')
  try {
    return JSON.parse(state ?? '') as PresenterState
  } catch {
    return null
  }
}

export const setPresenterState = (state: PresenterState) => {
  window.localStorage.setItem('presenter-state', JSON.stringify(state))
}
