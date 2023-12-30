import { useEffect, useRef, useState, PropsWithChildren } from 'react'

export type DraggableProps = {
  initialPosition?: Record<string, unknown>
}

/**
 * https://stackoverflow.com/a/61667523
 */
export function Draggable({
  initialPosition = {},
  children,
}: PropsWithChildren<DraggableProps>) {
  const [pressed, setPressed] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  // Monitor changes to position state and update DOM
  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = `translate(${position.x}px, ${position.y}px)`
    }
  }, [ref, position])

  // Register mouse event handling
  useEffect(() => {
    if (!pressed) return

    const onMouseUp = () => setPressed(false)
    const onMouseMove = (event: MouseEvent) => {
      setPosition(({ x, y }) => ({
        x: x + event.movementX,
        y: y + event.movementY,
      }))
    }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [pressed, setPressed, setPosition])

  return (
    <div
      ref={ref}
      onMouseDown={() => setPressed(true)}
      style={{
        position: 'absolute',
        ...initialPosition,
      }}
    >
      {children}
    </div>
  )
}
