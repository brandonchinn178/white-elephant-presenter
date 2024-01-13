<script lang="ts">
import Header from '$lib/header/Header.svelte'
import SetupPage from '$lib/setup/SetupPage.svelte'
import GamePage from '$lib/game/GamePage.svelte'
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
  type PresenterState,
  type PresenterStateGame,
  type PresenterStateSetup,
} from '$lib/state'

const INITIAL_STATE = getEmptyState()

let state = INITIAL_STATE

const updateState = <Args extends unknown[]>(
  f: (state: PresenterState, ...args: Args) => PresenterState,
  ...args: Args
) => {
  state = f(state, ...args)
}

const openGift = canOpenGift(state)
  ? (gift: string) => updateState(doOpenGift, gift)
  : null
const getStealGiftFunc = (targetIndex: number) =>
  canStealGift(state, targetIndex)
    ? () => updateState(doStealGift, targetIndex)
    : null
const passTurn = canPassTurn(state) ? () => updateState(doPassTurn) : null
</script>

<Header resetData={() => console.log('reset data')} />
<div class="flex-fill my-4">
  {#if state.phase == 'setup'}
    <SetupPage
      configuration={state.configuration}
      players={state.players}
      canStart={canStartGame(state)}
      updateConfig={(key, value) => updateState(updateConfig, key, value)}
      addPlayer={(name) => updateState(playerAdd, name)}
      removePlayer={(name) => updateState(playerRemove, name)}
      startGame={() => updateState(startGame)}
    />
  {:else if state.phase == 'game'}
    {@const settings = state.setupConfig.configuration}
    {@const board = state.playerOrder.map((player, i) => ({
      index: i,
      name: player,
      gift: state.gifts[i] ?? null,
    }))}
    <GamePage
      board={board}
      currentPlayerIndex={state.currentPlayerIndex}
      nextPlayerIndex={state.nextPlayerIndex}
      isDone={state.roundType === 'done'}
      timerEnabled={settings.timerEnabled}
      defaultTimerDurationSecs={settings.defaultTimerDurationSecs}
      openGift={openGift}
      getStealGiftFunc={getStealGiftFunc}
      passTurn={passTurn}
      resetGame={() => updateState(resetGame)}
    />
  {/if}
</div>
