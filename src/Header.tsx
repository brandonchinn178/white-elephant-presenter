import { useRef } from 'react'

import { getModal } from './Modal'

export type HeaderProps = {
  resetData: ModalClearDataProps['resetData']
}

export function Header({ resetData }: HeaderProps) {
  return (
    <>
      <nav
        className="navbar navbar-expand border-bottom"
        aria-label="main navigation"
      >
        <div className="container-fluid">
          <h1 className="navbar-brand">White Elephant Presenter</h1>
          <ul className="navbar-nav">
            <li className="nav-item ms-2">
              <a
                className="btn btn-secondary"
                href="https://www.whiteelephantrules.com/"
                target="_blank"
                rel="noreferrer"
              >
                View rules
              </a>
            </li>
            <li className="nav-item ms-2">
              <button
                className="btn btn-danger"
                data-bs-toggle="modal"
                data-bs-target="#modal-clear-data"
              >
                Clear data
              </button>
              <ModalClearData resetData={resetData} />
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}

type ModalClearDataProps = {
  resetData: () => void
}

function ModalClearData({ resetData }: ModalClearDataProps) {
  const modalRef = useRef(null)

  return (
    <div
      ref={modalRef}
      id="modal-clear-data"
      className="modal"
      tabIndex={-1}
      aria-label="Clear data"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Are you sure?</h5>
          </div>
          <div className="modal-body">
            This will completely clear all the data on the site.
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
                resetData()
                getModal(modalRef).hide()
              }}
            >
              Clear data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
