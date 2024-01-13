<script lang="ts">
import { type PresenterStateConfig } from '$lib/state'

export type UpdateConfigFunc = <T extends keyof PresenterStateConfig>(
  key: T,
  value: PresenterStateConfig[T]
) => void

export let configuration: PresenterStateConfig
export let updateConfig: UpdateConfigFunc

let {
  maxSteals,
  defaultTimerDurationSecs,
  timerEnabled,
} = configuration
</script>

<div class="col">
  <div class="row mb-3">
    <label for="settings.maxSteals" class="col-9 col-form-label">
      Max number of steals
    </label>
    <div class="col">
      <input
        id="settings.maxSteals"
        class="form-control"
        type="number"
        bind:value={maxSteals}
        on:change={() => updateConfig('maxSteals', maxSteals)}
      />
    </div>
  </div>
  <div class="row mb-3">
    <label
      for="settings.defaultTimerDurationSecs"
      class="col-9 col-form-label"
    >
      Default timer duration (seconds)
    </label>
    <div class="col">
      <input
        id="settings.defaultTimerDurationSecs"
        class="form-control"
        type="number"
        bind:value={defaultTimerDurationSecs}
        on:change={() => updateConfig('defaultTimerDurationSecs', defaultTimerDurationSecs)}
        disabled={!timerEnabled}
      />
    </div>
  </div>
  <div class="row mb-3">
    <div class="col">
      <div class="form-check form-check-reverse form-switch">
        <label for="settings.timerEnabled" class="form-check-label">
          Enable timer
        </label>
        <input
          id="settings.timerEnabled"
          class="form-check-input"
          role="switch"
          type="checkbox"
          bind:value={timerEnabled}
          on:change={() => updateConfig('timerEnabled', timerEnabled)}
        />
      </div>
    </div>
  </div>
</div>
