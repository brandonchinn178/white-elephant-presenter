import { useEffect, useRef } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'

import { getModal, onModalLoad } from '../Modal'
import { PresenterStateConfig } from '../state'

export type ModalSettingsProps = {
  config: PresenterStateConfig
  saveConfig: (config: PresenterStateConfig) => void
}

export function ModalSettings({ config, saveConfig }: ModalSettingsProps) {
  const formState = useForm({
    values: config,
  })

  const modalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    onModalLoad(modalRef, () => {
      formState.reset(config)
    })
  }, [config, formState])

  const updateConfig = () => {
    saveConfig(formState.getValues())
    getModal(modalRef).hide()
  }

  return (
    <>
      <button
        className="btn btn-outline-primary"
        data-bs-toggle="modal"
        data-bs-target="#modal-settings"
      >
        Settings
      </button>
      <div
        ref={modalRef}
        id="modal-settings"
        className="modal"
        tabIndex={-1}
        aria-labelledby="modal-settings-label"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Settings</h5>
            </div>
            <div className="modal-body">
              <ConfigForm formState={formState} />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={updateConfig}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ConfigForm({
  formState: { register, watch },
}: {
  formState: UseFormReturn<PresenterStateConfig>
}) {
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
            min="0"
            {...register('maxSteals', {
              valueAsNumber: true,
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
            min="1"
            {...register('defaultTimerDurationSecs', {
              valueAsNumber: true,
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
              {...register('timerEnabled')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
