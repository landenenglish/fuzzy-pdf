export const useScrollToHighestDensity = ({
  templateRefName,
  selector,
  watchSources,
  debounce = 200,
}: {
  templateRefName: MaybeRefOrGetter<string>
  selector: MaybeRefOrGetter<string>
  watchSources: MaybeRefOrGetter[]
  debounce?: number
}) => {
  const templateRef = useTemplateRef<HTMLElement>(toValue(templateRefName))

  const scrollToHighestDensity = () => {
    const container = templateRef.value
    if (!container) return

    container.scrollTop = 0

    const matches = container.querySelectorAll(toValue(selector))
    if (matches.length === 0) return

    const viewportHeight = container.clientHeight
    const scrollRange = container.scrollHeight - viewportHeight

    if (scrollRange <= 0) return

    const numWindows = Math.ceil(container.scrollHeight / viewportHeight)
    const densityMap = new Array(numWindows).fill(0)

    matches.forEach((match) => {
      const matchTop = (match as HTMLElement).offsetTop
      const windowIndex = Math.floor(matchTop / viewportHeight)
      if (windowIndex >= 0 && windowIndex < densityMap.length) {
        densityMap[windowIndex]++
      }
    })

    let maxDensity = 0
    let maxDensityIndex = 0

    densityMap.forEach((density, index) => {
      if (density > maxDensity) {
        maxDensity = density
        maxDensityIndex = index
      }
    })

    container.scrollTop = maxDensityIndex * viewportHeight
  }

  onMounted(() => {
    scrollToHighestDensity()
  })

  watchDebounced(watchSources, scrollToHighestDensity, { debounce })

  return {
    scrollToHighestDensity,
    templateRef,
  }
}
