import arrayShuffle from 'array-shuffle'
import { and, assign, createMachine, not, raise, stop } from 'xstate'

const createPresenterMachine = () =>
  createMachine({
    initial: 'setup',
    states: {
      setup: {
        invoke: {
          src: createSetupMachine(),
          id: 'setup',
          onDone: 'game',
          input: ({ event }) => ({ config: event.config }),
        },
      },
      game: {
        entry: [
          assign({
            setupConfig: ({ event }) => event.output,
            gameActor: ({ event, spawn }) => {
              const { players, configuration } = event.output
              const gameMachine = createGameMachine(players, configuration)
              return spawn(gameMachine, { id: 'game' })
            },
          }),
        ],
        exit: stop('game'),
        on: {
          RESET_GAME: {
            actions: raise(({ context }) => ({
              type: 'RETURN_TO_SETUP',
              config: context.setupConfig,
            })),
          },
          RETURN_TO_SETUP: {
            target: 'setup',
          },
        },
      },
    },
    on: {
      RESET_ALL: {
        target: '.setup',
      },
    },
  })

const createSetupMachine = () =>
  createMachine({
    context: ({ input }) => {
      return input.config ?? {
        configuration: {
          maxSteals: 3,
          timerEnabled: false,
          defaultTimerDurationSecs: 60,
        },
        players: [],
      }
    },
    initial: 'running',
    states: {
      running: {
        on: {
          UPDATE_CONFIG: {
            guard: {
              type: 'isValidConfigUpdate',
              params: ({ event }) => ({
                key: event.key,
                value: event.value,
              })
            },
            actions: [
              assign({
                configuration: ({ context, event }) => ({
                  ...context.configuration,
                  [event.key]: event.value,
                }),
              }),
            ],
          },
          ADD_PLAYER: {
            guard: {
              type: 'isValidPlayer',
              params: ({ event }) => ({ name: event.name })
            },
            actions: [
              assign({
                players: ({ context, event }) => {
                  return [...context.players, event.name]
                },
              }),
            ],
          },
          REMOVE_PLAYER: {
            actions: [
              assign({
                players: ({ context, event }) => {
                  return context.players.filter((player) => player !== event.name)
                },
              }),
            ],
          },
          END: {
            guard: 'hasPlayers',
            target: 'done',
          },
        },
      },
      done: {
        type: 'final',
      },
    },
    output: ({ context }) => context,
  }, {
    guards: {
      isValidConfigUpdate(_, { key, value }) {
        switch (key) {
          case 'maxSteals':
            return value >= 0
          case 'defaultTimerDurationSecs':
            return value > 0
          default:
            return true
        }
      },
      isValidPlayer({ context }, { name }) {
        return name.length > 0 && !context.players.includes(name)
      },
      hasPlayers({ context }) {
        return context.players.length > 0
      },
    },
  })

const createGameMachine = (players, settings) => {
  const initialContext = {
    settings,
    playerOrder: arrayShuffle(players),
    gifts: {},
  }

  const normalRounds =
    Array.from({ length: players.length }, (_, i) => {
      const thisRound = `round${i}`
      const [nextRound, nextPlayerIndex] =
        i + 1 < players.length
          ? [`round${i + 1}`, i + 1]
          : ['finalSwap', 0]
      return [
        thisRound,
        {
          entry: assign({
            currentPlayerIndex: i,
            nextPlayerIndex,
          }),
          on: {
            OPEN_GIFT: {
              actions: [
                assign({
                  gifts: ({ context, event }) => ({
                    ...context.gifts,
                    [context.currentPlayerIndex]: {
                      label: event.gift,
                      stealsLeft: settings.maxSteals,
                    },
                  }),
                }),
              ],
              target: nextRound,
            },
            STEAL: {
              guard: {
                type: 'canStealFrom',
                params: ({ event }) => ({
                  targetIndex: event.targetIndex,
                }),
              },
              actions: [
                {
                  type: 'stealFrom',
                  params: ({ event }) => ({
                    targetIndex: event.targetIndex,
                  }),
                },
                assign({
                  currentPlayerIndex: ({ event }) => event.targetIndex,
                }),
              ],
            },
          },
        },
      ]
    })

  const lastRounds = {
    finalSwap: {
      entry: assign({
        currentPlayerIndex: 0,
        nextPlayerIndex: null,
      }),
      on: {
        PASS: {
          target: 'done',
        },
        STEAL: {
          guard: and([
            not({
              type: 'isFirstPlayer',
              params: ({ event }) => ({
                playerIndex: event.targetIndex,
              }),
            }),
            {
              type: 'canStealFrom',
              params: ({ event }) => ({
                targetIndex: event.targetIndex,
              }),
            },
          ]),
          actions: {
            type: 'stealFrom',
            params: ({ event }) => ({
              targetIndex: event.targetIndex,
            }),
          },
          target: 'done',
        },
      },
    },
    done: {
      type: 'final',
      entry: assign({
        currentPlayerIndex: null,
        nextPlayerIndex: null,
      }),
    },
  }

  return createMachine({
    context: initialContext,
    initial: 'round0',
    states: {
      ...Object.fromEntries(normalRounds),
      ...lastRounds,
    },
  }, {
    guards: {
      isFirstPlayer(_, { playerIndex }) {
        return playerIndex === 0
      },
      canStealFrom({ context }, { targetIndex }) {
        const gift = context.gifts[targetIndex]
        return gift && gift.stealsLeft > 0
      },
    },
    actions: {
      stealFrom: assign({
        gifts: ({ context }, { targetIndex }) => {
          const { gifts, currentPlayerIndex } = context

          const oldGift = gifts[currentPlayerIndex]
          const giftBeingStolen = gifts[targetIndex]
          return {
            ...gifts,
            [currentPlayerIndex]: {
              ...giftBeingStolen,
              stealsLeft: giftBeingStolen.stealsLeft - 1,
            },
            [targetIndex]: oldGift,
          }
        },
      }),
    },
  })
}

export const presenterMachine = createPresenterMachine()
