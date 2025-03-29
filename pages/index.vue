<script setup lang="ts">
import type { FuseResultMatch } from 'fuse.js'

const file = ref<File>()
const search = ref('')

const { processedPages, totalPages, pdfUrl } = usePDFjs({
  file,
})

watchEffect(() => {
  if (!file.value) {
    search.value = ''
  }
})

const { searchResults } = useFuse({
  searchQuery: search,
  list: processedPages,
  options: {
    keys: ['text'],
  },
})

const visiblePagesIncrement = 25
const visiblePages = ref<number>(visiblePagesIncrement)

useWindowScroll({
  onAlmostAtBottom: () => {
    nextTick(() => {
      visiblePages.value += visiblePagesIncrement
    })
  },
})

watchEffect(() => {
  if (search.value || file.value) {
    visiblePages.value = visiblePagesIncrement
  }
})

const filteredPages = computed<
  {
    page: number
    text: string
    matches?: ReadonlyArray<FuseResultMatch>
    score?: number
  }[]
>(() => {
  if (!search.value) return processedPages.value.slice(0, visiblePages.value)

  return searchResults.value.slice(0, visiblePages.value).map((result) => {
    return {
      ...result.item,
      ...result,
    }
  })
})
</script>

<template>
  <div class="flex flex-col items-center">
    <header class="mb-4 flex flex-col items-center justify-center">
      <h1 class="mb-4 text-4xl font-bold tracking-tight text-primary-500">
        Fuzzy PDF
      </h1>
      <p class="text-sm italic text-gray-500">When Ctrl+F doesn't cut it</p>
    </header>

    <MainFileUpload v-model="file" class="mb-8" />

    <FileSearchInput v-if="file" v-model="search" class="mb-8" />

    <template v-if="file && totalPages">
      <div class="w-full max-w-2xl">
        <p class="mb-4 text-sm text-gray-500">
          {{ searchResults.length || totalPages }} of {{ totalPages }} pages
        </p>

        <RawPageCard
          v-for="page in filteredPages"
          :key="page.page"
          :page="page.page"
          :text="page.text"
          :pdf-url="pdfUrl!"
          :matches="page.matches"
          :score="page.score"
          :search="search"
        />
      </div>
    </template>
  </div>
</template>

<style>
.p-progressbar-label {
  display: none !important;
}
</style>
