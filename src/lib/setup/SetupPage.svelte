<script lang="ts">
import ConfigureGame from '$lib/setup/ConfigureGame.svelte'
import { type PresenterStateConfig } from '$lib/state'

export let configuration: PresenterStateConfig
export let players: string[]
export let canStart: boolean
export let updateConfig: ConfigureGame.UpdateConfigFunc
export let addPlayer: (name: string) => void
export let removePlayer: (name: string) => void
export let startGame: () => void

let addPlayerName = ''
const submitAddPlayer = () => {
  if (!addPlayerName) return
  addPlayer(addPlayerName.trim())
  addPlayerName = ''
}
</script>

<div
  class="container d-flex flex-column pb-4"
  style:height="100%"
>
  <div class="row mb-4">
    <div class="col text-center">
      <button
        class="btn btn-success"
        on:click={startGame}
        disabled={!canStart}
      >
        Start game!
      </button>
    </div>
  </div>
  <div class="row gx-5 flex-fill">
    <ConfigureGame
      configuration={configuration}
      updateConfig={updateConfig}
    />
    <div class="col border-start">
      <!-- Add player -->
      <form class="row mb-2" on:submit|preventDefault={submitAddPlayer}>
        <div class="col pe-0">
          <input
            class="form-control"
            placeholder="Add a player"
            bind:value={addPlayerName}
          />
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-primary">+</button>
        </div>
      </form>

      <!-- List players -->
      <div>
        {#each players.toReversed() as player}
          <div class="row mb-2" key={player}>
            <div class="col">
              <div class="border rounded-2 my-1 p-2">
                <button
                  type="button"
                  class="btn btn-close bg-danger float-end ms-2"
                  aria-label="Remove player"
                  on:click={() => removePlayer(player)}
                ></button>
                <span class="text-break m-0">{player}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
