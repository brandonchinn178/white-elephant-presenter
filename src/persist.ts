import { PresenterState } from './state'

export const getPresenterState = () => {
  const state = window.localStorage.getItem('presenter-state')
  try {
    return JSON.parse(state ?? '') as PresenterState
  } catch {
    return null
  }
}

export const setPresenterState = (state) => {
  window.localStorage.setItem('presenter-state', JSON.stringify(state))
}
