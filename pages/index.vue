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

const visiblePagesIncrement = 15
const visiblePagesCount = ref<number>(visiblePagesIncrement)

// Rendering the page cards is the largest performance bottleneck
// This is a simple solution to load more pages when the user scrolls to the bottom
useWindowScroll({
  onAlmostAtBottom: () => {
    nextTick(() => {
      visiblePagesCount.value += visiblePagesIncrement
    })
  },
})

watchEffect(() => {
  if (search.value || file.value) {
    visiblePagesCount.value = visiblePagesIncrement

    const scrollToElement = document.querySelector('.scroll-to-element')

    if (scrollToElement) {
      scrollToElement.scrollIntoView({ behavior: 'smooth' })
    }
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
  if (!search.value) return processedPages.value

  return searchResults.value.map((result) => {
    return {
      ...result.item,
      ...result,
    }
  })
})

const visiblePages = computed(() =>
  filteredPages.value.slice(0, visiblePagesCount.value)
)
</script>

<template>
  <div class="flex flex-col items-center">
    <header class="mb-4 flex flex-col items-center justify-center">
      <h1 class="mb-4 text-4xl font-bold tracking-tight text-primary-500">
        PDF Fuzzy Search
      </h1>
      <h2 class="text-sm italic text-gray-500">When Ctrl+F isn't enough</h2>
    </header>

    <MainFileUpload v-model="file" />

    <div class="scroll-to-element mb-8"></div>

    <FileSearchInput v-if="file" v-model="search" class="mb-8" />

    <template v-if="file && totalPages">
      <div class="w-full max-w-2xl">
        <p class="mb-4 text-sm text-gray-500">
          {{ filteredPages.length }} of {{ totalPages }} pages
        </p>

        <RawPageCard
          v-for="page in visiblePages"
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
