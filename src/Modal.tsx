export const getModal = (modalRef: { current: HTMLElement | null }) => {
  const modal = modalRef.current
  if (!modal) {
    throw new Error('Could not get reference to modal')
  }
  return bootstrap.Modal.getInstance(modal)
}
