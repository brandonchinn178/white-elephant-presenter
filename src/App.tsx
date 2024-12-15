import { useEffect, useState } from 'react'

import { Header } from './Header'
import { PageGame } from './game/PageGame'
import { getPresenterState, setPresenterState } from './persist'
import {
  PresenterState,
  PresenterStateConfig,
  configSet,
  getEmptyState,
  getRoundInfo,
  giftOpen,
  giftSteal,
  giftUpdate,
  passTurn,
  Player,
  playerAdd,
  playerRemove,
  playersReshuffle,
  resetAll,
  resetGifts,
} from './state'

export default function App() {
  const [state, setState] = useState(
    () => getPresenterState() ?? getEmptyState()
  )

  useEffect(() => {
    setPresenterState(state)
  }, [state])

  return (
    <>
      <Header resetData={() => setState(resetAll)} />
      <div className="flex-fill my-4">
        <PresenterAppGame state={state} updateState={setState} />
      </div>
    </>
  )
}

function PresenterAppGame({
  state,
  updateState,
}: {
  state: PresenterState
  updateState: (f: (state: PresenterState) => PresenterState) => void
}) {
  const roundInfo = getRoundInfo(state)
  const { currPlayer } = roundInfo
  const board = state.players.map((player) => ({
    name: player,
    gift: state.gifts[player] ?? null,
  }))

  return (
    <PageGame
      board={board}
      roundInfo={roundInfo}
      config={state.config}
      saveConfig={(config: PresenterStateConfig) =>
        updateState(configSet(config))
      }
      addPlayer={(player: string) => updateState(playerAdd(player))}
      removePlayer={(player: string) => updateState(playerRemove(player))}
      reshufflePlayers={() => updateState(playersReshuffle)}
      openGift={(gift: string) =>
        currPlayer !== null && updateState(giftOpen(currPlayer, gift))
      }
      updateGift={(player: string, gift: string, currSteals: number) =>
        updateState(giftUpdate(player, gift, currSteals))
      }
      stealGift={(targetPlayer: Player) =>
        currPlayer !== null && updateState(giftSteal(currPlayer, targetPlayer))
      }
      passTurn={() => updateState(passTurn)}
      resetGifts={() => updateState(resetGifts)}
    />
  )
}
