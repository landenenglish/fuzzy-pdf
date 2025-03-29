import { watchDebounced } from '@vueuse/core'
import Fuse, {
  type FuseResult,
  type FuseSearchOptions,
  type IFuseOptions,
} from 'fuse.js'

const defaultFuseOptions = {
  isCaseSensitive: false,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 1,
  shouldSort: true,
  findAllMatches: true,
  keys: [],
  location: 0,
  threshold: 0.3,
  distance: 100,
  ignoreLocation: true,
} as const satisfies IFuseOptions<string>

export function useFuse<T = string>({
  searchQuery,
  list,
  options = defaultFuseOptions,
  searchOptions,
  debounce = 0,
}: {
  searchQuery: MaybeRefOrGetter<string>
  list: MaybeRefOrGetter<T[]>
  options?: MaybeRefOrGetter<IFuseOptions<T>>
  searchOptions?: MaybeRefOrGetter<FuseSearchOptions>
  debounce?: number
}) {
  const fuse = computed(
    () =>
      new Fuse<T>(toValue(list), {
        ...defaultFuseOptions,
        ...toValue(options),
      })
  )

  const computedSearchQuery = computed(() => toValue(searchQuery))
  const computedSearchOptions = computed(() => toValue(searchOptions))
  const searchResultsRef = ref<FuseResult<T>[]>([])
  const searchResults = computed(() => searchResultsRef.value)

  watchDebounced(
    [computedSearchQuery, computedSearchOptions],
    ([query, opts]) => {
      searchResultsRef.value = fuse.value.search(query, opts) as FuseResult<T>[]
    },
    { debounce }
  )

  const dedupedSearchResults = computed(() =>
    searchResults.value.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.item === item.item)
    )
  )

  const closestMatch = computed(() => searchResults.value[0] ?? null)

  return {
    fuse,
    searchResults,
    closestMatch,
  }
}
