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

  loadFromData(data) {
    this.phase = data.phase || 'setup'
    this.players = data.players || []
    this.board = data.board || []
  }

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

  reset() {
    if (!confirm('This will clear all the data. Are you sure?')) return

    this.loadFromData({})
  }

  /***** Phase controllers *****/

  get setup() {
    this.expectPhase('setup')
    return new SetupController(this)
  }

  get game() {
    this.expectPhase('game')
    return new GameController(this)
  }

  expectPhase(expected) {
    if (this.phase !== expected) {
      throw new Error(`Expected phase: ${expected}, got: ${this.phase}`)
    }
  }
}

class SetupController {
  constructor(state) {
    this.state = state
  }

  get players() {
    return this.state.players
  }

  addPlayer(player) {
    if (this.state.players.includes(player)) {
      return
    }

    this.state.players.push(player)
  }

  removePlayer(player) {
    this.state.players = this.state.players.filter((p) => p !== player)
  }

  startGame() {
    this.state.phase = 'game'
    this.state.game.init()
  }
}

class GameController {
  constructor(state) {
    this.state = state
  }

  get board() {
    return this.state.board
  }

  get isDone() {
    return this.currentPlayer === null
  }

  get currentPlayer() {
    // TODO: handle first player at end
    const player = this.state.board.find(({ gift }) => gift === null)
    return player ? player.name : null
  }

  init() {
    this.state.board =
      shuffleArray(this.state.players).map(
        (player) => ({ name: player, gift: null })
      )
  }
}

/**
 * Return a new array containing the elements in the given array shuffled randomly.
 * https://stackoverflow.com/a/46545530
 */
function shuffleArray(arr) {
  return arr
    .map((value) => ({ value, key: Math.random() }))
    .sort((a, b) => a.key - b.key)
    .map(({ value }) => value)
}
