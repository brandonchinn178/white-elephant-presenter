export type ModalResetGiftsProps = {
  resetGifts: () => void
}

export function ModalResetGifts({ resetGifts }: ModalResetGiftsProps) {
  return (
    <>
      <button
        className="btn btn-outline-danger"
        data-bs-toggle="modal"
        data-bs-target="#modal-reset-gifts"
      >
        Reset gifts
      </button>
      <div
        id="modal-reset-gifts"
        className="modal"
        tabIndex={-1}
        aria-labelledby="modal-reset-gifts-label"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 id="modal-reset-gifts-label">Reset gifts</h5>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reset the gifts?</p>
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
                onClick={resetGifts}
                data-bs-dismiss="modal"
              >
                Reset gifts
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
