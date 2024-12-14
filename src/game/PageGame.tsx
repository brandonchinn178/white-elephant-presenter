import './PageGame.css'

import { useEffect, useRef } from 'react'
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
  removePlayer: (player: string) => void
} & Pick<PlayerCardProps, 'openGift' | 'stealGift' | 'passTurn'> &
  Pick<GameBannerProps, 'addPlayer' | 'saveConfig'> &
  Pick<ModalReshuffleOrderProps, 'reshufflePlayers'> &
  Pick<ModalResetGiftsProps, 'resetGifts'>

// TODO: remove players
// TODO: edit gifts
export function PageGame({
  board,
  roundInfo,
  config,
  ...actions
}: PageGameProps) {
  const { maxSteals, defaultTimerDurationSecs, timerEnabled } = config

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
            {...actions}
          />
        ))}
      </div>
      <div className="d-flex gap-3 justify-content-center">
        <ModalResetGifts {...actions} />
        <ModalReshuffleOrder {...actions} />
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
  openGift: ModalOpenGiftProps['openGift']
  stealGift: (targetPlayer: PlayerName) => void
  passTurn: () => void
}

function PlayerCard({
  player,
  playerNum,
  roundInfo,
  maxSteals,
  openGift,
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
        "
      >
        <span>#{playerNum}</span>
      </div>
      <div
        className="p-2"
        style={{
          // `min-width: 0` to override `min-width: auto`:
          // https://stackoverflow.com/q/36247140/8620333
          minWidth: 0,
        }}
      >
        <p>
          <span className="fw-bold">{player.name}</span>
          {isCurrPlayer && <span>&mdash; It&apos;s your turn!</span>}
          {isNextPlayer && <span>&mdash; You&apos;re up next!</span>}
        </p>
        {player.gift !== null && (
          <div>
            <p
              ref={giftLabelRef}
              className="mw-100 text-truncate"
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
          </div>
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
