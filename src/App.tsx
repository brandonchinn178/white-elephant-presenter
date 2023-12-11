import { useMachine, useSelector } from '@xstate/react'

import { Header } from './Header'
import { PageGame } from './PageGame'
import { PageSetup } from './PageSetup'
import { getPresenterState, setPresenterState } from './persist'
import { presenterMachine } from './state'

const INITIAL_STATE = getPresenterState()

export default function App() {
  const [state, send] = useMachine(presenterMachine, {
    systemId: 'root',
    snapshot: INITIAL_STATE,
    inspect: (event) => {
      persistState(event)
    },
  })

  return (
    <>
      <Header resetData={() => send({ type: 'RESET_ALL' })} />
      <div className="flex-fill my-4">
        <PresenterApp state={state} send={send} />
      </div>
    </>
  )
}

function PresenterApp({ state, send }) {
  switch (true) {
    case state.matches('setup'):
      return <PresenterAppSetup actorRef={state.children.setup!} />
    case state.matches('game'):
      return (
        <PresenterAppGame
          actorRef={state.children.game!}
          resetGame={() => send({ type: 'RESET_GAME' })}
        />
      )
  }
}

const persistState = (event) => {
  if (event.type !== '@xstate.snapshot') {
    return
  }

  if (event.event.type.startsWith('xstate.')) {
    return
  }

  const root = event.actorRef.system.get('root')
  setPresenterState(root.getPersistedSnapshot())
}

function PresenterAppSetup({ actorRef }) {
  const { configuration, players } = useSelector(actorRef, s => s.context)
  const canStart = useSelector(actorRef, s => s.can({ type: 'END' }))

  return (
    <PageSetup
      configuration={configuration}
      players={players}
      canStart={canStart}
      updateConfig={(key, value) => actorRef.send({ type: 'UPDATE_CONFIG', key, value })}
      addPlayer={(name: string) => actorRef.send({ type: 'ADD_PLAYER', name })}
      removePlayer={(name: string) => actorRef.send({ type: 'REMOVE_PLAYER', name })}
      startGame={() => actorRef.send({ type: 'END' })}
    />
  )
}

function PresenterAppGame({ actorRef, resetGame }) {
  const snapshot = useSelector(actorRef, s => s)
  const {
    playerOrder,
    gifts,
    currentPlayerIndex,
    nextPlayerIndex,
  } = useSelector(actorRef, s => s.context)

  const board = playerOrder.map((player, i) => ({
    index: i,
    name: player,
    gift: gifts[i] ?? null,
  }))

  const openGift =
    snapshot.can({ type: 'OPEN_GIFT', gift: 'some_gift' })
      ? (gift) => actorRef.send({ type: 'OPEN_GIFT', gift })
      : null
  const getStealGiftFunc = (targetIndex) =>
    snapshot.can({ type: 'STEAL', targetIndex })
      ? () => {
        actorRef.send({ type: 'STEAL', targetIndex })
      }
      : null
  const passTurn =
    snapshot.can({ type: 'PASS' })
      ? () => actorRef.send({ type: 'PASS' })
      : null

  return (
    <PageGame
      board={board}
      currentPlayerIndex={currentPlayerIndex}
      nextPlayerIndex={nextPlayerIndex}
      isDone={snapshot.matches('done')}
      openGift={openGift}
      getStealGiftFunc={getStealGiftFunc}
      passTurn={passTurn}
      resetGame={resetGame}
    />
  )
}
