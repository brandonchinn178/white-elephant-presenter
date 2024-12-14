export const onModalLoad = (
  modalRef: { current: HTMLElement | null },
  callback: () => void
): void => {
  const modal = modalRef.current
  if (!modal) {
    return
  }

  modal.addEventListener('shown.bs.modal', callback)
}

export const getModal = (modalRef: { current: HTMLElement | null }) => {
  const modal = modalRef.current
  if (!modal) {
    throw new Error('Could not get reference to modal')
  }
  return bootstrap.Modal.getInstance(modal)
}
