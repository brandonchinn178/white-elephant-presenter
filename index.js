document.addEventListener('alpine:init', () => {
  Alpine.data('PresenterState', () => ({
    state: PresenterState.loadFromStorage(),
    init() {
      this.$watch('state', () => this.state.saveToStorage())
    },
  }))
})

class PresenterState {
  constructor(info) {
    this.phase = info.phase || 'setup'
    this.players = info.players || []
  }

  static loadFromStorage() {
    if (!window.localStorage) {
      window.alert("Your browser does not support local storage. Your changes will not be saved.")
    }

    const state = window.localStorage.getItem("presenter-state")
    if (state !== null) {
      return new PresenterState(state)
    }

    return new PresenterState({})
  }

  saveToStorage() {
    window.localStorage.setItem("presenter-state", JSON.stringify(this.state))
  }
}
