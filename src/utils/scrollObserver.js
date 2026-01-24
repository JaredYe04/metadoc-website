/**
 * 滚动观察工具，用于检测元素在视口中的可见度
 */
export function useScrollObserver(elementRef, callback, options = {}) {
  const {
    threshold = 0,
    rootMargin = '0px',
    once = false
  } = options

  let observer = null
  let hasTriggered = false

  const observe = () => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold
          
          if (isVisible) {
            if (!once || !hasTriggered) {
              callback(entry.intersectionRatio, entry.boundingClientRect)
              if (once) {
                hasTriggered = true
              }
            }
          }
        })
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin
      }
    )

    observer.observe(elementRef.value)
  }

  const unobserve = () => {
    if (observer && elementRef.value) {
      observer.unobserve(elementRef.value)
      observer.disconnect()
      observer = null
    }
  }

  return {
    observe,
    unobserve
  }
}

/**
 * 计算元素在视口中的滚动进度 (0-1)
 */
export function getScrollProgress(element) {
  if (!element) return 0
  
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const elementHeight = rect.height
  
  // 元素顶部进入视口到完全离开视口的进度
  const scrollStart = windowHeight
  const scrollEnd = -elementHeight
  const scrollRange = scrollStart - scrollEnd
  
  const currentScroll = scrollStart - rect.top
  const progress = Math.max(0, Math.min(1, currentScroll / scrollRange))
  
  return progress
}

