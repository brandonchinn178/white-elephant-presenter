import './PageGame.css'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { getModal, onModalLoad } from '../Modal'
import { Gift, PresenterStateConfig, RoundInfo } from '../state'
import { ModalAddPlayers, ModalAddPlayersProps } from './ModalAddPlayers'
import {
  ModalReshuffleOrder,
  ModalReshuffleOrderProps,
} from './ModalReshuffleOrder'
import { ModalResetGifts, ModalResetGiftsProps } from './ModalResetGifts'
import { ModalSettings, ModalSettingsProps } from './ModalSettings'
import { Timer } from './Timer'

type PlayerName = string
type Player = {
  name: PlayerName
  gift: Gift | null
}

type PageGameProps = {
  board: Player[]
  roundInfo: RoundInfo
  config: PresenterStateConfig
} & Pick<
  PlayerCardProps,
  'removePlayer' | 'openGift' | 'updateGift' | 'stealGift' | 'passTurn'
> &
  Pick<GameBannerProps, 'addPlayer' | 'saveConfig'> &
  Pick<ModalReshuffleOrderProps, 'reshufflePlayers'> &
  Pick<ModalResetGiftsProps, 'resetGifts'>

export function PageGame({
  board,
  roundInfo,
  config,
  ...actions
}: PageGameProps) {
  const { maxSteals, defaultTimerDurationSecs, timerEnabled } = config

  const [isEditable, setEditable] = useState(false)

  return (
    <div className="container-fluid d-flex flex-column gap-3">
      <GameBanner roundInfo={roundInfo} config={config} {...actions} />
      <div id="game-board" className="d-flex flex-wrap gap-3">
        {board.map((player, i) => (
          <PlayerCard
            key={player.name}
            player={player}
            playerNum={i + 1}
            roundInfo={roundInfo}
            maxSteals={maxSteals}
            isEditable={isEditable}
            {...actions}
          />
        ))}
      </div>
      <div className="d-flex gap-3 justify-content-center">
        {!isEditable ? (
          <>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setEditable(true)}
            >
              Edit board
            </button>
            <ModalResetGifts {...actions} />
            <ModalReshuffleOrder {...actions} />
          </>
        ) : (
          <button
            className="btn btn-success"
            onClick={() => setEditable(false)}
          >
            Lock board
          </button>
        )}
      </div>
      {timerEnabled && <Timer defaultDurationSecs={defaultTimerDurationSecs} />}
    </div>
  )
}

type GameBannerProps = {
  roundInfo: RoundInfo
} & ModalAddPlayersProps &
  ModalSettingsProps

function GameBanner({ roundInfo, ...modalProps }: GameBannerProps) {
  if (roundInfo.type === 'done') {
    return <h2 className="text-center">Game finished!</h2>
  }

  return (
    <div className="d-flex justify-content-between">
      {roundInfo.currPlayer && (
        <h3>
          Current player: <b>{roundInfo.currPlayer}</b>
        </h3>
      )}
      <div className="d-flex gap-3">
        <ModalAddPlayers {...modalProps} />
        <ModalSettings {...modalProps} />
      </div>
    </div>
  )
}

type PlayerCardProps = {
  player: Player
  playerNum: number
  roundInfo: RoundInfo
  maxSteals: number
  isEditable: boolean
  removePlayer: (player: string) => void
  openGift: ModalOpenGiftProps['openGift']
  updateGift: EditGiftFormProps['updateGift']
  stealGift: (targetPlayer: PlayerName) => void
  passTurn: () => void
}

function PlayerCard({
  player,
  playerNum,
  roundInfo,
  maxSteals,
  isEditable,
  removePlayer,
  openGift,
  updateGift,
  stealGift,
  passTurn,
}: PlayerCardProps) {
  const giftLabelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const giftLabel = giftLabelRef.current
    if (!giftLabel) {
      return
    }
    bootstrap.Tooltip.getOrCreateInstance(giftLabel)
  }, [player.gift, giftLabelRef])

  const isCurrPlayer = player.name === roundInfo.currPlayer
  const isNextPlayer = player.name === roundInfo.nextPlayer
  const stealsLeft = maxSteals - (player.gift?.currSteals ?? 0)

  return (
    <div
      className="
        card
        flex-fill flex-row
        border-primary
        bg-gradient
        fs-5
      "
      data-is-current-player={isCurrPlayer}
      data-is-next-player={isNextPlayer}
    >
      <div
        className="
          p-2
          border-end border-primary border-2
          text-center
          d-flex flex-column gap-1
        "
      >
        <span>#{playerNum}</span>
        {isEditable && (
          <button
            className="btn btn-close bg-danger"
            onClick={() => removePlayer(player.name)}
          />
        )}
      </div>
      <div
        className="p-2"
        style={{
          // `min-width: 0` to override `min-width: auto`:
          // https://stackoverflow.com/q/36247140/8620333
          minWidth: 0,
        }}
      >
        <p className="m-0">
          <span className="fw-bold">{player.name}</span>
          {isCurrPlayer && <span>&mdash; It&apos;s your turn!</span>}
          {isNextPlayer && <span>&mdash; You&apos;re up next!</span>}
        </p>
        {!isEditable ? (
          <>
            {player.gift !== null && (
              <>
                <p
                  ref={giftLabelRef}
                  className="m-0 mw-100 text-truncate"
                  data-bs-toggle="tooltip"
                  data-bs-title={player.gift.label}
                  data-bs-placement="bottom"
                  data-bs-delay='{ "show": 500 }'
                >
                  {player.gift.label}
                </p>
                {stealsLeft > 0 && (
                  <div>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => stealGift(player.name)}
                    >
                      Steal
                    </button>
                    <i className="ms-2 fs-6">
                      (Steals left: <span>{stealsLeft}</span>)
                    </i>
                  </div>
                )}
              </>
            )}
            {isCurrPlayer && (
              <>
                {roundInfo.type === 'normal' && (
                  <>
                    <button
                      className="btn btn-sm btn-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#modal-open-gift"
                    >
                      Open gift
                    </button>
                    <ModalOpenGift openGift={openGift} />
                  </>
                )}
                {roundInfo.type === 'finalSwap' && (
                  <button className="btn btn-sm btn-primary" onClick={passTurn}>
                    Pass
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <EditGiftForm player={player} updateGift={updateGift} />
        )}
      </div>
    </div>
  )
}

type EditGiftFormProps = {
  player: Player
  updateGift: (player: string, gift: string, currSteals: number) => void
}

function EditGiftForm({ player, updateGift }: EditGiftFormProps) {
  const { register, getValues } = useForm({
    defaultValues: player.gift ?? {
      label: '',
      currSteals: 0,
    },
  })

  const update = () => {
    const values = getValues()
    updateGift(player.name, values.label, values.currSteals)
  }

  return (
    <div className="d-flex flex-column gap-2">
      <input
        {...register('label', {
          onChange: update,
        })}
      />
      <div>
        <label htmlFor="edit-gift.num-steals" className="me-2">
          # of steals:
        </label>
        <input
          id="edit-gift.num-steals"
          className="w-2"
          type="number"
          min="0"
          {...register('currSteals', {
            valueAsNumber: true,
            onChange: update,
          })}
        />
      </div>
    </div>
  )
}

type ModalOpenGiftProps = {
  openGift: (gift: string) => void
}

function ModalOpenGift({ openGift }: ModalOpenGiftProps) {
  const { register, handleSubmit, setFocus, resetField } = useForm({
    defaultValues: {
      gift: '',
    },
  })
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onModalLoad(modalRef, () => {
      resetField('gift')
      setFocus('gift')
    })
  }, [modalRef, resetField, setFocus])

  const submitOpenGift = ({ gift }: { gift: string }) => {
    getModal(modalRef).hide()
    openGift(gift)
  }

  return (
    <div
      ref={modalRef}
      id="modal-open-gift"
      className="modal"
      tabIndex={-1}
      aria-labelledby="modal-open-gift-label"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit(submitOpenGift)}>
            <div id="modal-open-gift-label" className="modal-header">
              Open a gift
            </div>
            <div className="modal-body">
              <label htmlFor="open-gift" className="col-form-label">
                Type in the gift that was opened:
              </label>
              <input
                id="open-gift"
                className="form-control"
                {...register('gift', { required: true })}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
