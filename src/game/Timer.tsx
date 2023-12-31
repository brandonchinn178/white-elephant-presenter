import { useEffect, useState } from 'react'

import { Draggable } from '../Draggable'

export type TimerProps = {
  defaultDurationSecs: number
}

export function Timer({ defaultDurationSecs }: TimerProps) {
  const [timer, setTimer] = useState(() => initTimerState(defaultDurationSecs))

  useEffect(() => {
    const interval = setInterval(() => setTimer(tickTimer), 300)
    return () => clearInterval(interval)
  }, [setTimer])

  const isDone = timer.secondsLeft <= 0

  return (
    <Draggable initialPosition={{ right: '1rem', bottom: '1rem' }}>
      <div
        className={`
          fs-3
          px-4 py-3 border border-3 border-primary rounded-3
          text-center
          ${isDone ? 'bg-danger' : 'bg-white'}
        `}
        style={{
          cursor: 'move',
          userSelect: 'none',
        }}
      >
        <p className="mb-0">{isDone ? "Time's up!" : getTime(timer)}</p>
        <div>
          <button
            className="btn btn-sm btn-outline-primary mx-1"
            onClick={() => {
              setTimer(timer.isRunning ? pauseTimer : startTimer)
            }}
          >
            {timer.isRunning ? 'Pause' : 'Play'}
          </button>
          <button
            className="btn btn-sm btn-outline-primary mx-1"
            onClick={() => setTimer(resetTimer)}
          >
            Reset
          </button>
          <button
            className="btn btn-sm btn-outline-primary mx-1"
            onClick={() => setTimer(addTimerSecs(5))}
          >
            +5s
          </button>
        </div>
      </div>
    </Draggable>
  )
}

/***** Timer state *****/

type TimerState = {
  defaultDurationSecs: number
  secondsLeft: number
} & (
  | {
      isRunning: false
      endTime: null
    }
  | {
      isRunning: true
      endTime: Date
    }
)

const initTimerState = (defaultDurationSecs: number): TimerState => ({
  defaultDurationSecs,
  secondsLeft: defaultDurationSecs,
  isRunning: false,
  endTime: null,
})

const getTime = (timer: TimerState): string => {
  const minutes = Math.floor(timer.secondsLeft / 60)
  const seconds = timer.secondsLeft % 60

  const minutesStr = minutes.toString().padStart(2, '0')
  const secondsStr = seconds.toString().padStart(2, '0')
  return `${minutesStr}:${secondsStr}`
}

const startTimer = (timer: TimerState): TimerState => {
  const startTime = new Date()
  return {
    ...timer,
    isRunning: true,
    endTime: new Date(startTime.getTime() + timer.secondsLeft * 1000),
  }
}

const restartTimer = startTimer

const tickTimer = (timer: TimerState): TimerState => {
  if (!timer.isRunning) {
    return timer
  }

  const now = new Date()
  const secondsLeft = Math.floor(
    (timer.endTime.getTime() - now.getTime()) / 1000
  )
  const newTimer = { ...timer, secondsLeft }
  return secondsLeft > 0 ? newTimer : pauseTimer(newTimer)
}

const pauseTimer = (timer: TimerState): TimerState => ({
  ...timer,
  isRunning: false,
  endTime: null,
})

const resetTimer = (timer: TimerState): TimerState => ({
  ...pauseTimer(timer),
  secondsLeft: timer.defaultDurationSecs,
})

const addTimerSecs = (seconds: number) => (timer: TimerState) => {
  const newTimer = {
    ...timer,
    secondsLeft: timer.secondsLeft + seconds,
  }
  return newTimer.isRunning ? restartTimer(newTimer) : newTimer
}
