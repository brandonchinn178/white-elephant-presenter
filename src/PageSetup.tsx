import { useForm } from 'react-hook-form'

import { PresenterStateConfig } from './state'

type UpdateConfigFunc = <T extends keyof PresenterStateConfig>(
  key: T,
  value: PresenterStateConfig[T]
) => void

type PageSetupProps = {
  configuration: ConfigureGameProps['configuration']
  players: PlayerListProps['players']
  canStart: boolean
  updateConfig: ConfigureGameProps['updateConfig']
  addPlayer: FormAddPlayerProps['addPlayer']
  removePlayer: PlayerListProps['removePlayer']
  startGame: () => void
}

export function PageSetup({
  configuration,
  players,
  canStart,
  updateConfig,
  addPlayer,
  removePlayer,
  startGame,
}: PageSetupProps) {
  return (
    <div
      className="container d-flex flex-column pb-4"
      style={{ height: '100%' }}
    >
      <div className="row mb-4">
        <div className="col text-center">
          <button
            className="btn btn-success"
            onClick={startGame}
            disabled={!canStart}
          >
            Start game!
          </button>
        </div>
      </div>
      <div className="row gx-5 flex-fill">
        <ConfigureGame
          configuration={configuration}
          updateConfig={updateConfig}
        />
        <div className="col border-start">
          <FormAddPlayer addPlayer={addPlayer} />
          <PlayerList players={players} removePlayer={removePlayer} />
        </div>
      </div>
    </div>
  )
}

type ConfigureGameProps = {
  configuration: PresenterStateConfig
  updateConfig: UpdateConfigFunc
}

function ConfigureGame({ configuration, updateConfig }: ConfigureGameProps) {
  const { register, getValues, watch } = useForm({
    values: configuration,
  })

  const update = (key: keyof PresenterStateConfig) =>
    updateConfig(key, getValues(key))

  return (
    <div className="col">
      <div className="row mb-3">
        <label htmlFor="settings.maxSteals" className="col-9 col-form-label">
          Max number of steals
        </label>
        <div className="col">
          <input
            id="settings.maxSteals"
            className="form-control"
            type="number"
            {...register('maxSteals', {
              valueAsNumber: true,
              onChange: () => update('maxSteals'),
            })}
          />
        </div>
      </div>
      <div className="row mb-3">
        <label
          htmlFor="settings.defaultTimerDurationSecs"
          className="col-9 col-form-label"
        >
          Default timer duration (seconds)
        </label>
        <div className="col">
          <input
            id="settings.defaultTimerDurationSecs"
            className="form-control"
            type="number"
            {...register('defaultTimerDurationSecs', {
              valueAsNumber: true,
              onChange: () => update('defaultTimerDurationSecs'),
              disabled: !watch('timerEnabled'),
            })}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <div className="form-check form-check-reverse form-switch">
            <label htmlFor="settings.timerEnabled" className="form-check-label">
              Enable timer
            </label>
            <input
              id="settings.timerEnabled"
              className="form-check-input"
              role="switch"
              type="checkbox"
              {...register('timerEnabled', {
                onChange: () => update('timerEnabled'),
              })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type FormAddPlayerProps = {
  addPlayer: (name: string) => void
}

function FormAddPlayer({ addPlayer }: FormAddPlayerProps) {
  const { register, handleSubmit, resetField } = useForm({
    defaultValues: {
      playerName: '',
    },
  })

  const submitAddPlayer = ({ playerName }: { playerName: string }) => {
    addPlayer(playerName.trim())
    resetField('playerName')
  }

  return (
    <form className="row mb-2" onSubmit={handleSubmit(submitAddPlayer)}>
      <div className="col pe-0">
        <input
          className="form-control"
          placeholder="Add a player"
          {...register('playerName', { required: true })}
        />
      </div>
      <div className="col-auto">
        <button className="btn btn-outline-primary">+</button>
      </div>
    </form>
  )
}

type PlayerListProps = {
  players: string[]
  removePlayer: (name: string) => void
}

function PlayerList({ players, removePlayer }: PlayerListProps) {
  return (
    <div>
      {players.toReversed().map((player) => (
        <div className="row mb-2" key={player}>
          <div className="col">
            <div className="border rounded-2 my-1 p-2">
              <button
                type="button"
                className="btn btn-close bg-danger float-end ms-2"
                aria-label="Remove player"
                onClick={() => removePlayer(player)}
              ></button>
              <span className="text-break m-0">{player}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
