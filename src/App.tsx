import { useEffect, useState } from 'react'

import { Header } from './Header'
import { PageGame } from './PageGame'
import { PageSetup } from './PageSetup'
import { getPresenterState, setPresenterState } from './persist'
import {
  canOpenGift,
  canPassTurn,
  canStartGame,
  canStealGift,
  doOpenGift,
  doPassTurn,
  doStealGift,
  getEmptyState,
  playerAdd,
  playerRemove,
  resetAll,
  resetGame,
  startGame,
  updateConfig,
  PresenterState,
  PresenterStateGame,
  PresenterStateSetup,
} from './state'

type UpdateState<State> = <Args>(
  f: (state: State, ...args: Args) => State,
  ...args: Args
) => void

type StateProps<State> = {
  state: State
  updateState: UpdateState<State>
}

const INITIAL_STATE = getPresenterState() ?? getEmptyState()

export default function App() {
  const [state, setState] = useState(INITIAL_STATE)
  const updateState = <Args,>(
    f: (state: PresenterState, ...args: Args) => PresenterState,
    ...args: Args
  ) => setState((state) => f(state, ...args))

  useEffect(() => {
    setPresenterState(state)
  }, [state])

  return (
    <>
      <Header resetData={() => updateState(resetAll)} />
      <div className="flex-fill my-4">
        <PresenterApp state={state} updateState={updateState} />
      </div>
    </>
  )
}

function PresenterApp({ state, updateState }: StateProps<PresenterState>) {
  switch (state.phase) {
    case 'setup':
      return <PresenterAppSetup state={state} updateState={updateState} />
    case 'game':
      return <PresenterAppGame state={state} updateState={updateState} />
  }
}

function PresenterAppSetup({
  state,
  updateState,
}: StateProps<PresenterStateSetup>) {
  return (
    <PageSetup
      configuration={state.configuration}
      players={state.players}
      canStart={canStartGame(state)}
      updateConfig={(key, value) => updateState(updateConfig, key, value)}
      addPlayer={(name) => updateState(playerAdd, name)}
      removePlayer={(name) => updateState(playerRemove, name)}
      startGame={() => updateState(startGame)}
    />
  )
}

function PresenterAppGame({
  state,
  updateState,
}: StateProps<PresenterStateGame>) {
  const board = state.playerOrder.map((player, i) => ({
    index: i,
    name: player,
    gift: state.gifts[i] ?? null,
  }))

  const openGift = canOpenGift(state)
    ? (gift: string) => updateState(doOpenGift, gift)
    : null
  const getStealGiftFunc = (targetIndex: number) =>
    canStealGift(state, targetIndex)
      ? () => updateState(doStealGift, targetIndex)
      : null
  const passTurn = canPassTurn(state) ? () => updateState(doPassTurn) : null

  return (
    <PageGame
      board={board}
      currentPlayerIndex={state.currentPlayerIndex}
      nextPlayerIndex={state.nextPlayerIndex}
      isDone={state.roundType === 'done'}
      openGift={openGift}
      getStealGiftFunc={getStealGiftFunc}
      passTurn={passTurn}
      resetGame={() => updateState(resetGame)}
    />
  )
}
