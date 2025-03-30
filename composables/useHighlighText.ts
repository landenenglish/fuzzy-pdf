export const highlightText = (
  text: MaybeRefOrGetter<string> = '',
  searchInput: MaybeRefOrGetter<string> = ''
) => {
  const textValue = toRef(text)
  const searchInputValue = toRef(searchInput)

  const searchWords = computed(() =>
    searchInputValue.value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length >= 3)
  )

  const searchPattern = computed(() => {
    const escapedWords = searchWords.value.map((word) =>
      word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    return new RegExp(`(${escapedWords.join('|')})`, 'gi')
  })

  return computed(() => {
    if (!searchInputValue.value.trim() || !searchWords.value.length) {
      return textValue.value
    }

    const highlightSpan =
      '<span class="bg-yellow-200 dark:bg-yellow-800 highlight-match">$1</span>'

    return textValue.value.replace(searchPattern.value, highlightSpan)
  })
}
