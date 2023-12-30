import arrayShuffle from 'array-shuffle'

export type PresenterState = PresenterStateSetup | PresenterStateGame

export type PresenterStateConfig = {
  maxSteals: number
  defaultTimerDurationSecs: number
  timerEnabled: boolean
}

export type PresenterStateSetup = {
  phase: 'setup'
  configuration: PresenterStateConfig
  players: string[]
}

export type PresenterStateGame = {
  phase: 'game'
  setupConfig: Omit<PresenterStateSetup, 'phase'>
  playerOrder: string[]
  gifts: Record<number, Gift>
} & (RoundNormal | RoundFinalSwap | RoundDone)

export type RoundNormal = {
  roundType: 'normal'
  currentPlayerIndex: number
  nextPlayerIndex: number
}

export type RoundFinalSwap = {
  roundType: 'finalSwap'
  currentPlayerIndex: number
  nextPlayerIndex: null
}

export type RoundDone = {
  roundType: 'done'
  currentPlayerIndex: null
  nextPlayerIndex: null
}

export type Gift = {
  label: string
  stealsLeft: number
}

/***** GENERAL *****/

export const getEmptyState = () => ({
  phase: 'setup',
  configuration: {
    maxSteals: 3,
    defaultTimerDurationSecs: 60,
    timerEnabled: false,
  },
  players: [],
})

export const resetAll = getEmptyState

/***** SETUP *****/

const canUpdateConfig = <T extends keyof PresenterStateConfig>(
  key: T,
  value: PresenterStateConfig[T]
): boolean => {
  switch (key) {
    case 'maxSteals':
      return value >= 0
    case 'defaultTimerDurationSecs':
      return value > 0
    default:
      return true
  }
}

export const updateConfig = <T extends keyof PresenterStateConfig>(
  state: PresenterStateSetup,
  key: T,
  value: PresenterStateConfig[T]
): PresenterStateSetup => {
  if (!canUpdateConfig(key, value)) {
    return state
  }

  return {
    ...state,
    configuration: {
      ...state.configuration,
      [key]: value,
    },
  }
}

export const playerAdd = (state: PresenterStateSetup, name: string) => {
  if (!(name.length > 0 && !state.players.includes(name))) {
    return state
  }

  return {
    ...state,
    players: [...state.players, name],
  }
}

export const playerRemove = (state: PresenterStateSetup, name: string) => ({
  ...state,
  players: state.players.filter((n) => n !== name),
})

export const canStartGame = (state: PresenterStateSetup) =>
  state.players.length > 0

export const startGame = (state: PresenterStateSetup): PresenterState => {
  if (!canStartGame(state)) {
    return state
  }

  return {
    phase: 'game',
    setupConfig: {
      configuration: state.configuration,
      players: state.players,
    },
    roundType: 'normal',
    playerOrder: arrayShuffle(state.players),
    gifts: {},
    currentPlayerIndex: 0,
    nextPlayerIndex: state.players.length > 1 ? 1 : 0,
  }
}

/***** GAME *****/

export const resetGame = (state: PresenterStateGame): PresenterStateSetup => ({
  phase: 'setup',
  ...state.setupConfig,
})

const toNextRound = (state: PresenterStateGame): PresenterStateGame => {
  const numPlayers = state.setupConfig.players.length

  let newRoundType = 'normal'
  let newCurrentPlayerIndex = state.nextPlayerIndex
  let newNextPlayerIndex = newCurrentPlayerIndex + 1
  switch (state.roundType) {
    case 'normal': {
      if (newCurrentPlayerIndex === numPlayers - 1) {
        newNextPlayerIndex = 0
      } else if (newCurrentPlayerIndex === 0) {
        newRoundType = 'finalSwap'
        newNextPlayerIndex = null
      }
      break
    }
    case 'finalSwap': {
      newRoundType = 'done'
      newCurrentPlayerIndex = null
      newNextPlayerIndex = null
      break
    }
    case 'done': {
      return state
    }
  }

  return {
    ...state,
    roundType: newRoundType,
    currentPlayerIndex: newCurrentPlayerIndex,
    nextPlayerIndex: newNextPlayerIndex,
  }
}

export const canOpenGift = (state: PresenterStateGame) =>
  state.roundType === 'normal'

export const doOpenGift = (
  state: PresenterStateGame,
  gift: string
): PresenterStateGame => {
  if (!canOpenGift(state)) {
    return state
  }

  const settings = state.setupConfig.configuration
  return toNextRound({
    ...state,
    gifts: {
      ...state.gifts,
      [state.currentPlayerIndex]: {
        label: gift,
        stealsLeft: settings.maxSteals,
      },
    },
  })
}

export const canStealGift = (
  state: PresenterStateGame,
  targetIndex: number
) => {
  const canSteal = () => {
    const gift = state.gifts[targetIndex]
    return gift && gift.stealsLeft > 0
  }
  switch (state.roundType) {
    case 'normal':
      return canSteal()
    case 'finalSwap':
      return targetIndex !== state.currentPlayerIndex && canSteal()
    case 'done':
      return false
  }
}

export const doStealGift = (
  state: PresenterStateGame,
  targetIndex: number
): PresenterStateGame => {
  if (!canStealGift(state, targetIndex)) {
    return state
  }

  let currentPlayerIndex
  switch (state.roundType) {
    case 'normal': {
      currentPlayerIndex = state.currentPlayerIndex
      break
    }
    case 'finalSwap': {
      currentPlayerIndex = state.currentPlayerIndex
      break
    }
    case 'done': {
      throw new Error('unreachable')
    }
  }

  const oldGift = state.gifts[currentPlayerIndex]
  const giftBeingStolen = state.gifts[targetIndex]

  return {
    ...state,
    gifts: {
      ...state.gifts,
      [currentPlayerIndex]: {
        ...giftBeingStolen,
        stealsLeft: giftBeingStolen.stealsLeft - 1,
      },
      [targetIndex]: oldGift,
    },
    currentPlayerIndex: targetIndex,
  }
}

export const canPassTurn = (state: PresenterStateGame) =>
  state.roundType === 'finalSwap'

export const doPassTurn = (state: PresenterStateGame): PresenterStateGame => {
  if (!canPassTurn(state)) {
    return state
  }
  return toNextRound(state)
}
