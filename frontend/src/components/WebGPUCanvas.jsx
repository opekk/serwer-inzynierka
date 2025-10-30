import { useEffect, useMemo, useRef, useState } from 'react'
import { useWebGPUCanvasInternal } from './WebGPUCanvasProvider.jsx'

export default function WebGPUCanvas({
  width: widthProp,
  height: heightProp,
  className = '',
  showControls = true,
  onModelChange = null
}) {
  const { attachSlot, detachSlot } = useWebGPUCanvasInternal()
  const slotIdRef = useRef(Symbol('WebGPUCanvasSlot'))
  const containerRef = useRef(null)
  const [measuredWidth, setMeasuredWidth] = useState(null)

  const widthProvided = useMemo(
    () => typeof widthProp === 'number' && !Number.isNaN(widthProp) && widthProp > 0,
    [widthProp]
  )
  const heightProvided = useMemo(
    () => typeof heightProp === 'number' && !Number.isNaN(heightProp) && heightProp > 0,
    [heightProp]
  )

  const normalizedWidth = useMemo(() => {
    if (widthProvided) {
      return Math.max(1, Math.round(widthProp))
    }
    if (heightProvided) {
      return Math.max(1, Math.round((heightProp * 4) / 3))
    }
    if (measuredWidth) {
      return Math.max(1, Math.round(measuredWidth))
    }
    return 800
  }, [heightProp, heightProvided, measuredWidth, widthProp, widthProvided])

  const normalizedHeight = useMemo(
    () => Math.round((normalizedWidth * 3) / 4),
    [normalizedWidth]
  )

  const stretchToContainer = useMemo(() => {
    return !widthProvided && !heightProvided
  }, [heightProvided, widthProvided])

  const anchorClassName = useMemo(
    () => ['webgpu-canvas-slot-anchor', className].filter(Boolean).join(' '),
    [className]
  )

  const anchorStyle = useMemo(() => {
    const style = {
      width: stretchToContainer ? '100%' : `${normalizedWidth}px`,
      aspectRatio: '4 / 3',
      position: 'relative'
    }

    if (!stretchToContainer) {
      style.maxWidth = `${normalizedWidth}px`
    }

    return style
  }, [normalizedWidth, stretchToContainer])

  useEffect(() => {
    if (!stretchToContainer) {
      setMeasuredWidth(null)
      return
    }

    const container = containerRef.current
    if (!container || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      const nextWidth = Math.max(
        1,
        Math.round(
          Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width
            : entry.contentBoxSize?.inlineSize ?? entry.contentRect.width
        )
      )

      setMeasuredWidth((prev) => (prev === nextWidth ? prev : nextWidth))
    })

    observer.observe(container)

    return () => observer.disconnect()
  }, [stretchToContainer])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    attachSlot(slotIdRef.current, container, {
      width: normalizedWidth,
      height: normalizedHeight,
      className,
      showControls,
      onModelChange,
      stretchToContainer
    })
  }, [attachSlot, normalizedWidth, normalizedHeight, className, showControls, onModelChange, stretchToContainer])

  useEffect(() => {
    const slotId = slotIdRef.current
    return () => detachSlot(slotId)
  }, [detachSlot])

  return <div ref={containerRef} className={anchorClassName} style={anchorStyle} />
}
