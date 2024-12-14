export type ModalReshuffleOrderProps = {
  reshufflePlayers: () => void
}

export function ModalReshuffleOrder({
  reshufflePlayers,
}: ModalReshuffleOrderProps) {
  return (
    <>
      <button
        className="btn btn-outline-danger"
        data-bs-toggle="modal"
        data-bs-target="#modal-reshuffle"
      >
        Reshuffle order
      </button>
      <div
        id="modal-reshuffle"
        className="modal"
        tabIndex={-1}
        aria-labelledby="modal-reshuffle-label"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 id="modal-reshuffle-label">Reshuffle players</h5>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reshuffle the players?</p>
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
                className="btn btn-danger"
                onClick={reshufflePlayers}
                data-bs-dismiss="modal"
              >
                Reshuffle
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
