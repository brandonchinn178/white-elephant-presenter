/***** CONFIG *****/

export type PresenterStateConfig = {
  maxSteals: number
  defaultTimerDurationSecs: number
  timerEnabled: boolean
}

/***** PLAYER *****/

export type Player = string

/**
 * Add a player into the game, at a random location.
 *
 * Modifies player list in place
 */
const insertPlayer = (players: Player[], name: string): void => {
  const newIndex = Math.floor(Math.random() * (players.length + 1))
  players.splice(newIndex, 0, name)
}

const addPlayer = (players: Player[], name: string): Player[] => {
  if (!(name.length > 0 && !players.includes(name))) {
    return players
  }

  const newPlayers = [...players]
  insertPlayer(newPlayers, name)
  return newPlayers
}

const removePlayer = (players: Player[], name: string): Player[] => {
  return players.filter((n) => n !== name)
}

const reshufflePlayers = (players: Player[]): Player[] => {
  const newPlayers: Player[] = []
  players.forEach((player) => insertPlayer(newPlayers, player))
  return newPlayers
}

/***** GIFT *****/

export type Gift = {
  label: string

  // number of times this gift has been stolen so far
  currSteals: number
}

export type Gifts = Record<string, Gift | undefined>

const openGift = (gifts: Gifts, player: Player, gift: string): Gifts => {
  return {
    ...gifts,
    [player]: { label: gift, currSteals: 0 },
  }
}

const stealGift = (
  gifts: Gifts,
  currPlayer: Player,
  targetPlayer: Player
): Gifts => {
  const oldGift = gifts[currPlayer]
  const giftBeingStolen = gifts[targetPlayer]
  if (!giftBeingStolen) {
    throw new Error(`stealGift called on player without gift: ${targetPlayer}`)
  }

  return {
    ...gifts,
    [currPlayer]: {
      ...giftBeingStolen,
      currSteals: giftBeingStolen.currSteals + 1,
    },
    // just in case the current player has a gift,
    // e.g. when swapping gifts at the end
    [targetPlayer]: oldGift,
  }
}

/***** GAME *****/

export type PresenterState = {
  config: PresenterStateConfig
  players: Player[]
  gifts: Gifts
  didFinalSwap: boolean
}

export const getEmptyState = (): PresenterState => {
  return {
    config: {
      maxSteals: 3,
      defaultTimerDurationSecs: 30,
      timerEnabled: false,
    },
    players: [],
    gifts: {},
    didFinalSwap: false,
  }
}

export const resetAll = (_: PresenterState): PresenterState => {
  return getEmptyState()
}

export const resetGifts = (state: PresenterState): PresenterState => {
  return {
    ...state,
    gifts: {},
    didFinalSwap: false,
  }
}

/***** ROUND *****/

export type RoundInfo = RoundInit | RoundNormal | RoundFinalSwap | RoundDone

export type RoundInit = {
  type: 'init'
  currPlayer: null
  nextPlayer: null
}

export type RoundNormal = {
  type: 'normal'
  currPlayer: Player
  nextPlayer: Player
}

export type RoundFinalSwap = {
  type: 'finalSwap'
  currPlayer: Player
  nextPlayer: null
}

export type RoundDone = {
  type: 'done'
  currPlayer: null
  nextPlayer: null
}

export const getRoundInfo = (state: PresenterState): RoundInfo => {
  if (state.players.length === 0) {
    return {
      type: 'init',
      currPlayer: null,
      nextPlayer: null,
    }
  }

  const firstPlayer = state.players[0]
  if (!firstPlayer) {
    throw new Error('No players found')
  }

  const playersWithoutGifts = state.players.filter(
    (player) => state.gifts[player] === undefined
  )
  const [currPlayer, nextPlayer, ..._] = playersWithoutGifts
  if (currPlayer) {
    return {
      type: 'normal',
      currPlayer: currPlayer,
      nextPlayer: nextPlayer ?? /* final swap */ firstPlayer,
    }
  }

  if (!state.didFinalSwap) {
    return {
      type: 'finalSwap',
      currPlayer: firstPlayer,
      nextPlayer: null,
    }
  }

  return {
    type: 'done',
    currPlayer: null,
    nextPlayer: null,
  }
}

/***** GAME ACTIONS *****/

export const configSet =
  (config: PresenterStateConfig) =>
  (state: PresenterState): PresenterState => {
    return {
      ...state,
      config,
    }
  }

export const playerAdd =
  (player: string) =>
  (state: PresenterState): PresenterState => {
    return {
      ...state,
      players: addPlayer(state.players, player),
    }
  }

export const playerRemove =
  (player: string) =>
  (state: PresenterState): PresenterState => {
    return {
      ...state,
      players: removePlayer(state.players, player),
    }
  }

export const playersReshuffle = (state: PresenterState): PresenterState => {
  return {
    ...state,
    players: reshufflePlayers(state.players),
  }
}

export const giftOpen =
  (gift: string, currPlayer: Player) =>
  (state: PresenterState): PresenterState => {
    return {
      ...state,
      gifts: openGift(state.gifts, currPlayer, gift),
    }
  }

export const giftSteal =
  (currPlayer: Player, targetPlayer: Player) =>
  (state: PresenterState): PresenterState => {
    return {
      ...state,
      gifts: stealGift(state.gifts, currPlayer, targetPlayer),
    }
  }

export const passTurn = (state: PresenterState): PresenterState => {
  return {
    ...state,
    didFinalSwap: true,
  }
}
