import './css/PageGame.css'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type Player = {
  index: number
  name: string
  gift: Gift | null
}

type Gift = {
  label: string
  stealsLeft: number
}

type TransitionFunc<T = []> = ((...args: T) => void) | null

type PageGameProps = {
  board: Player[]
  currentPlayerIndex: number | null
  nextPlayerIndex: number | null
  isDone: boolean
  openGift: PlayerCardProps['openGift']
  getStealGiftFunc: (targetIndex: number) => PlayerCardProps['stealGift']
  passTurn: PlayerCardProps['passTurn']
  resetGame: ModalResetGameProps['resetGame']
}

export function PageGame({
  board,
  currentPlayerIndex,
  nextPlayerIndex,
  isDone,
  openGift,
  getStealGiftFunc,
  passTurn,
  resetGame,
}: PageGameProps) {
  const currentPlayer =
    currentPlayerIndex === null ? null : board[currentPlayerIndex]

  const [timerEnabled] = useState(false)

  return (
    <div className="container-fluid">
      {isDone && <h2 className="text-center">Game finished!</h2>}
      {currentPlayer !== null && (
        <h2 className="text-center">
          Current player: <b>{currentPlayer.name}</b>
        </h2>
      )}
      <div id="game-board" className="d-flex flex-wrap">
        {board.map((player) => (
          <PlayerCard
            key={player.name}
            player={player}
            currentPlayerIndex={currentPlayerIndex}
            nextPlayerIndex={nextPlayerIndex}
            openGift={openGift}
            stealGift={getStealGiftFunc(player.index)}
            passTurn={passTurn}
          />
        ))}
      </div>
      <div className="mt-4 text-center">
        <button
          className="btn btn-outline-danger"
          data-bs-toggle="modal"
          data-bs-target="#modal-reset-game"
        >
          Reset game
        </button>
        <ModalResetGame resetGame={resetGame} />
      </div>
      {timerEnabled && (
        <Timer
          phase="paused"
          timeDisplay=""
          startTimer={() => {
            /* TODO */
          }}
          pauseTimer={() => {
            /* TODO */
          }}
          resetTimer={() => {
            /* TODO */
          }}
          addTimerSecs={() => {
            /* TODO */
          }}
        />
      )}
    </div>
  )
}

type PlayerCardProps = {
  player: Player
  currentPlayerIndex: number | null
  nextPlayerIndex: number | null
  openGift: ModalOpenGiftProps['openGift'] | null
  stealGift: TransitionFunc
  passTurn: TransitionFunc
}

function PlayerCard({
  player,
  currentPlayerIndex,
  nextPlayerIndex,
  openGift,
  stealGift,
  passTurn,
}: PlayerCardProps) {
  const giftLabelRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const giftLabel = giftLabelRef.current
    if (!giftLabel) {
      return
    }
    // eslint-disable-next-line
    bootstrap.Tooltip.getOrCreateInstance(giftLabel)
  }, [player.gift, giftLabelRef])

  return (
    <div
      className="
        card
        flex-fill flex-row
        m-2
        border-primary
        bg-gradient
        fs-5
      "
      data-is-current-player={
        player.index === currentPlayerIndex ? 'true' : undefined
      }
      data-is-next-player={
        player.index === nextPlayerIndex ? 'true' : undefined
      }
    >
      <div
        className="
          p-2
          border-end border-primary border-2
          text-center
        "
      >
        <span>#{player.index + 1}</span>
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
          {player.index === currentPlayerIndex && (
            <span>&mdash; It&apos;s your turn!</span>
          )}
          {player.index === nextPlayerIndex && (
            <span>&mdash; You&apos;re up next!</span>
          )}
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
            {stealGift && (
              <div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={stealGift}
                >
                  Steal
                </button>
                <i className="ms-2 fs-6">
                  (Steals left: <span>{player.gift.stealsLeft}</span>)
                </i>
              </div>
            )}
          </div>
        )}
        {player.index === currentPlayerIndex && (
          <div>
            {openGift && (
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
            {passTurn && (
              <button className="btn btn-sm btn-primary" onClick={passTurn}>
                Pass
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

type TimerProps = {
  phase: 'paused' | 'running' | 'done'
  timeDisplay: string
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  addTimerSecs: (secs: number) => void
}

function Timer({
  phase,
  timeDisplay,
  startTimer,
  pauseTimer,
  resetTimer,
  addTimerSecs,
}: TimerProps) {
  const isDone = phase === 'done'
  const isRunning = phase === 'running'

  // TODO: initTimer()
  return (
    <div
      className={`
        fs-3
        px-4 py-3 border border-3 border-primary rounded-3
        text-center
        ${isDone ? 'gs-danger' : 'bg-white'}
      `}
      style={{
        cursor: 'move',
        position: 'absolute',
        right: '1rem',
        bottom: '1rem',
      }}
    >
      <p className="mb-0">{isDone ? "Time's up!" : timeDisplay}</p>
      <div>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={isRunning ? pauseTimer : startTimer}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        <button className="btn btn-sm btn-outline-primary" onClick={resetTimer}>
          Reset
        </button>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => addTimerSecs(5)}
        >
          +5s
        </button>
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
  const modalRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const modal = modalRef.current

    modal.addEventListener('hidden.bs.modal', () => {
      resetField('gift')
    })
    modal.addEventListener('shown.bs.modal', () => {
      setFocus('gift')
    })
  }, [modalRef, resetField, setFocus])

  const submitOpenGift = ({ gift }: { gift: string }) => {
    // eslint-disable-next-line
    bootstrap.Modal.getInstance(modalRef.current).hide()
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

type ModalResetGameProps = {
  resetGame: () => void
}

function ModalResetGame({ resetGame }: ModalResetGameProps) {
  const modalRef = useRef(null)

  return (
    <div
      ref={modalRef}
      id="modal-reset-game"
      className="modal"
      tabIndex={-1}
      aria-label="Reset game"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Are you sure?</h5>
          </div>
          <div className="modal-body">
            This will clear all game progress and go back to the setup screen.
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                resetGame()
                // eslint-disable-next-line
                bootstrap.Modal.getInstance(modalRef.current).hide()
              }}
            >
              Reset game
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
