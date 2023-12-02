document.addEventListener('alpine:init', () => {
  Alpine.data('PresenterApp', () => new PresenterApp())
})

class PresenterApp {
  constructor() {
    this.$app = this
    this.state = PresenterState.loadFromStorage()
  }

  init() {
    this.$watch('state', () => this.state.saveToStorage())
  }

  reset() {
    // TODO: show modal instead of default javascript confirm
    if (!confirm('This will clear all the data. Are you sure?')) return

    this.state.reset()
  }

  /***** Phase-specific controllers *****/

  get phase() {
    return this.state.phase
  }

  get setup() {
    return new PresenterSetupController(this.state.setup, this.state)
  }

  get game() {
    return new PresenterGameController(this.state.game)
  }
}

class PresenterSetupController {
  constructor(state, appState) {
    this.state = state
    this.appState = appState
  }

  get settings() {
    return this.state.settings
  }

  get players() {
    return this.state.players
  }

  addPlayer(player) {
    this.state.addPlayer(player)
  }

  removePlayer(player) {
    this.state.removePlayer(player)
  }

  startGame() {
    if (this.state.players.length === 0) {
      throw new Error('Cannot start game with 0 players')
    }

    this.appState.phase = 'game'
    this.appState.game.init()
  }
}

class PresenterGameController {
  constructor(state) {
    this.state = state
  }

  get board() {
    return this.state.board
  }

  get isStealing() {
    return this.state.isStealing
  }

  get isDone() {
    return this.state.isDone
  }

  get currentPlayer() {
    return this.state.getCurrentPlayer()
  }

  get nextPlayer() {
    return this.state.getNextPlayer()
  }

  isCurrentPlayer(player) {
    return this.state.isCurrentPlayer(player)
  }

  isNextPlayer(player) {
    return this.state.isNextPlayer(player)
  }

  promptGift() {
    // TODO: use modal instead of prompt()
    const gift = prompt('Type in the gift:')
    if (!gift) return
    this.state.setGiftForCurrentPlayer(gift)
  }

  startSteal() {
    this.state.startSteal()
  }

  canStealFrom(targetPlayer) {
    return this.state.canStealFrom(targetPlayer)
  }

  stealGiftFrom(targetPlayer) {
    this.state.stealGiftFrom(targetPlayer)
  }

  cancelSteal() {
    this.state.stopSteal()
  }
}

/***** Game state *****/

class PresenterState {
  constructor() {
    this.loadFromData({})
  }

  loadFromData(data) {
    this.phase = data.phase || 'setup'
    this.settings = data.settings || {
      maxSteals: 3,
      allowStealBacks: false,
      defaultTimerDurationSecs: 30,
    }
    this.players = data.players || []
    this.board = data.board || []
    this.isStealing = data.isStealing || false
  }

  reset() {
    this.loadFromData({})
  }

  /***** Persistence *****/

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

  /***** Phase-specific state *****/

  get setup() {
    this.expectPhase('setup')
    return new PresenterSetupState(this)
  }

  get game() {
    // this currently throws errors if resetting in a game
    // https://github.com/alpinejs/alpine/discussions/3900
    this.expectPhase('game')
    return new PresenterGameState(this)
  }

  expectPhase(expected) {
    if (this.phase !== expected) {
      throw new Error(`Expected phase: ${expected}, got: ${this.phase}`)
    }
  }
}

class PresenterSetupState {
  constructor(state) {
    this.state = state
  }

  get settings() {
    return this.state.settings
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
}

class PresenterGameState {
  constructor(state) {
    this.state = state
  }

  init() {
    this.state.board =
      shuffleArray(this.state.players).map(
        (player, i) => ({
          index: i,
          name: player,
          gift: null,
        })
      )
  }

  get settings() {
    return this.state.settings
  }

  get board() {
    return this.state.board
  }

  get isStealing() {
    return this.state.isStealing
  }

  get isDone() {
    return this.getCurrentPlayer() === null
  }

  getCurrentPlayer() {
    // TODO: handle first player at end
    const player = this.board.find(({ gift }) => gift === null)
    return player ? player : null
  }

  getNextPlayer() {
    const currentPlayer = this.getCurrentPlayer()
    for (let i = currentPlayer.index + 1; i < this.board.length; i++) {
      const player = this.board[i]
      if (player.gift === null) {
        return player
      }
    }
    return null
  }

  isCurrentPlayer(player) {
    const currentPlayer = this.getCurrentPlayer()
    return currentPlayer && player.index === currentPlayer.index
  }

  isNextPlayer(player) {
    const nextPlayer = this.getNextPlayer()
    return nextPlayer && player.index === nextPlayer.index
  }

  setGiftForCurrentPlayer(gift) {
    const currentPlayer = this.getCurrentPlayer()
    currentPlayer.gift = {
      label: gift,
      stealsLeft: this.settings.maxSteals,
      lastOwner: null,
    }
  }

  startSteal() {
    this.state.isStealing = true
  }

  canStealFrom(targetPlayer) {
    if (targetPlayer.gift.stealsLeft <= 0) {
      return false
    }

    if (!this.settings.allowStealBacks) {
      if (targetPlayer.gift.lastOwner === this.getCurrentPlayer()) {
        return false
      }
    }

    return true
  }

  stealGiftFrom(targetPlayer) {
    if (targetPlayer.gift === null) {
      throw new Error(`Player '${targetPlayer}' does not have a gift!`)
    }

    if (!this.canStealFrom(targetPlayer)) {
      throw new Error(`Gift '${targetPlayer.gift.label}' cannot be stolen!`)
    }

    const currentPlayer = this.getCurrentPlayer()

    // steal gift
    currentPlayer.gift = targetPlayer.gift
    targetPlayer.gift = null

    // update gift
    currentPlayer.gift.stealsLeft--
    currentPlayer.gift.lastOwner = targetPlayer

    this.stopSteal()
  }

  stopSteal() {
    this.state.isStealing = false
  }
}

/***** Utilities *****/

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
