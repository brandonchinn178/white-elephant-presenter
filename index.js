document.addEventListener('alpine:init', () => {
  Alpine.data('PresenterState', () => ({
    state: PresenterState.loadFromStorage(),
    init() {
      this.$watch('state', () => this.state.saveToStorage())
    },
  }))
})

class PresenterState {
  /***** Loading/saving *****/

  static loadFromStorage() {
    if (!window.localStorage) {
      window.alert("Your browser does not support local storage. Your changes will not be saved.")
    }

    const state = new PresenterState()

    const data = window.localStorage.getItem("presenter-state")
    if (data) {
      state.loadFromData(JSON.parse(data))
    }

    return state
  }

  saveToStorage() {
    window.localStorage.setItem("presenter-state", JSON.stringify(this))
  }

  loadFromData(data) {
    this.phase = data.phase || 'setup'
    this.players = data.players || []
  }

  reset() {
    this.loadFromData({})
  }

  /***** Setup phase *****/

  endSetup() {
    this.requirePhase('setup')
    this.phase = 'game'
  }

  /***** Game phase *****/

  /***** Helpers *****/

  requirePhase(expected) {
    if (this.phase !== expected) {
      throw new Error(`Expected phase: ${expected}, got: ${this.phase}`)
    }
  }
}
