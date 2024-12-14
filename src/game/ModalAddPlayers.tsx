import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { onModalLoad } from '../Modal'

export type ModalAddPlayersProps = {
  addPlayer: (player: string) => void
}

export function ModalAddPlayers({ addPlayer }: ModalAddPlayersProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <button
        className="btn btn-outline-primary"
        data-bs-toggle="modal"
        data-bs-target="#modal-add-players"
      >
        Add players
      </button>
      <div
        ref={modalRef}
        id="modal-add-players"
        className="modal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <AddPlayerInput
                addPlayer={addPlayer}
                onLoad={(callback: () => void) =>
                  onModalLoad(modalRef, callback)
                }
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function AddPlayerInput({
  addPlayer,
  onLoad,
}: {
  addPlayer: (name: string) => void
  onLoad: (callback: () => void) => void
}) {
  const { register, handleSubmit, setFocus, resetField } = useForm({
    defaultValues: {
      player: '',
    },
  })

  useEffect(() => {
    onLoad(() => {
      resetField('player')
      setFocus('player')
    })
  }, [onLoad, resetField, setFocus])

  const handleAddPlayer = ({ player }: { player: string }) => {
    addPlayer(player)
    resetField('player')
  }

  return (
    <form className="row mb-2" onSubmit={handleSubmit(handleAddPlayer)}>
      <div className="col pe-0">
        <input
          className="form-control"
          placeholder="Add a player"
          {...register('player', { required: true })}
        />
      </div>
      <div className="col-auto">
        <button className="btn btn-outline-primary">+</button>
      </div>
    </form>
  )
}
