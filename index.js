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

  resetAll() {
    this.resetGame()
    this.state.resetAllData()
  }

  resetGame() {
    this.state.resetGameData()

    // if reset while clearing data, make sure timer's cleaned up
    if (this.state.phase === 'game') {
      this.game.pauseTimer()
    }
  }

  /***** Phase-specific controllers *****/

  get phase() {
    return this.state.phase
  }

  get setup() {
    return new PresenterSetupController(this.state.setup, this)
  }

  get game() {
    return new PresenterGameController(this.state.game, this)
  }
}

class PresenterSetupController {
  constructor(state, app) {
    this.state = state
    this.app = app
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

    this.app.state.phase = 'game'
    this.app.game.init()
  }
}

class PresenterGameController {
  constructor(state, app) {
    this.state = state
    this.app = app

    if (!this.app.timerState) {
      this.resetTimer()
    }
  }

  init() {
    this.state.init()
    this.resetTimer()
  }

  get board() {
    return this.state.board
  }

  get timer() {
    return this.app.timerState
  }

  get isStealing() {
    return this.state.isStealing
  }

  get isDone() {
    return this.state.isDone()
  }

  get isFinalSwap() {
    return this.state.isFinalSwap()
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

  setGiftForCurrentPlayer(gift) {
    this.state.setGiftForCurrentPlayer(gift)
  }

  /***** Stealing *****/

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

  passFinalSwap() {
    this.state.endFinalSwap()
  }

  /***** Timer *****/

  startTimer() {
    const timer = this.app.timerState
    if (timer.isRunning || timer.secondsLeft <= 0) return

    const startTime = new Date()
    timer.endTime = new Date(startTime.getTime() + timer.secondsLeft * 1000)
    timer.interval = setInterval(() => {
      const now = new Date()
      const secondsLeft = Math.floor((timer.endTime - now) / 1000)
      if (secondsLeft <= 0) {
        this.pauseTimer()
      }
      timer.secondsLeft = Math.max(secondsLeft, 0)
    }, 300)
    timer.isRunning = true
  }

  pauseTimer() {
    const timer = this.app.timerState
    if (!timer.isRunning) return

    clearInterval(timer.interval)
    timer.endTime = null
    timer.interval = null
    timer.isRunning = false
  }

  resetTimer() {
    // if reset while running, make sure everything's cleaned up
    if (this.app.timerState) {
      this.pauseTimer()
    }

    this.app.timerState = {
      secondsLeft: this.state.settings.defaultTimerDurationSecs,
      isRunning: false,

      get display() {
        const minutes = Math.floor(this.secondsLeft / 60)
        const seconds = this.secondsLeft % 60

        const minutesStr = minutes.toString().padStart(2, '0')
        const secondsStr = seconds.toString().padStart(2, '0')
        return `${minutesStr}:${secondsStr}`
      },

      get isDone() {
        return this.secondsLeft === 0
      },
    }
  }

  addTimerSecs(seconds) {
    const timer = this.app.timerState
    timer.secondsLeft += seconds
    if (timer.endTime) {
      timer.endTime = new Date(timer.endTime.getTime() + seconds * 1000)
    }
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
    this.didFirstPlayerGoAgain = data.didFirstPlayerGoAgain || false
  }

  resetAllData() {
    this.loadFromData({})
  }

  resetGameData() {
    this.phase = 'setup'
    this.board = []
    this.isStealing = false
    this.didFirstPlayerGoAgain = false
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

  isDone() {
    return this.getCurrentPlayer() === null
  }

  getCurrentPlayer() {
    // find first player with no gift
    const player = this.board.find(({ gift }) => gift === null)
    if (player) {
      return player
    }

    // if first player hasn't done their final swap yet, the first player
    // is the current player again
    if (!this.state.didFirstPlayerGoAgain) {
      return this.board[0]
    }

    return null
  }

  getNextPlayer() {
    const currentPlayer = this.getCurrentPlayer()
    if (!currentPlayer) {
      return null
    }

    // find first player after current player with no gift
    for (let i = currentPlayer.index + 1; i < this.board.length; i++) {
      const player = this.board[i]
      if (player.gift === null) {
        return player
      }
    }

    // if first player hasn't done their final swap yet, return the first player
    if (!this.state.didFirstPlayerGoAgain && currentPlayer.index !== 0) {
      return this.board[0]
    }

    return null
  }

  isFinalSwap() {
    const currentPlayer = this.getCurrentPlayer()
    return (
      !this.state.didFirstPlayerGoAgain
      && currentPlayer.index === 0
      && currentPlayer.gift !== null
    )
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
      const currentPlayer = this.getCurrentPlayer()
      if (targetPlayer.gift.lastOwner === currentPlayer.name) {
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
    const isFinalSwap = this.isFinalSwap()

    // steal/swap gifts
    const currentGift = currentPlayer.gift
    currentPlayer.gift = targetPlayer.gift
    targetPlayer.gift = currentGift

    // update gift
    currentPlayer.gift.stealsLeft--
    currentPlayer.gift.lastOwner = targetPlayer.name

    this.stopSteal()

    if (isFinalSwap) {
      this.endFinalSwap()
    }
  }

  stopSteal() {
    this.state.isStealing = false
  }

  endFinalSwap() {
    this.state.didFirstPlayerGoAgain = true
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
