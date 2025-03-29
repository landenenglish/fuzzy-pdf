<script setup lang="ts">
import type { FuseResultMatch } from 'fuse.js'
import Badge from 'primevue/badge'
import { ref, watch, onMounted } from 'vue'

const { page, text, pdfUrl, search } = defineProps<{
  page: number
  text: string
  pdfUrl: string

  search?: string
  matches?: ReadonlyArray<FuseResultMatch>
  score?: number
}>()

const expanded = ref(false)
const maxHeight = '120px'
const textContainer = useTemplateRef<HTMLDivElement>('textContainer')

const toggleHeight = () => {
  expanded.value = !expanded.value
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
}

const highlightText = (text: string, searchInput?: string) => {
  if (!searchInput || searchInput.trim() === '') return text

  const searchWords = searchInput.trim().split(/\s+/)

  const regex = new RegExp(`\\b(${searchWords.join('|')})\\b`, 'gi')

  return text.replace(
    regex,
    '<span class="bg-yellow-200 dark:bg-yellow-800 highlight-match">$1</span>'
  )
}

const scrollToHighlightDensity = () => {
  if (!textContainer.value || !search || search.trim() === '') return

  setTimeout(() => {
    const container = textContainer.value
    if (!container) return

    const highlights = container.querySelectorAll('.highlight-match')
    if (highlights.length === 0) return

    const viewportHeight = container.clientHeight
    const scrollRange = container.scrollHeight - viewportHeight

    if (scrollRange <= 0) return

    const numWindows = Math.ceil(container.scrollHeight / viewportHeight)
    const densityMap = new Array(numWindows).fill(0)

    highlights.forEach((highlight) => {
      const highlightTop = (highlight as HTMLElement).offsetTop
      const windowIndex = Math.floor(highlightTop / viewportHeight)
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
  }, 100)
}

watch(
  () => search,
  () => {
    if (textContainer.value) {
      textContainer.value.scrollTop = 0
      scrollToHighlightDensity()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (search && search.trim()) {
    scrollToHighlightDensity()
  }
})
</script>

<template>
  <Card
    class="mb-4 w-full overflow-hidden border-0 p-2 shadow-sm hover:shadow-md"
  >
    <template #title>
      <div class="flex items-center justify-between">
        <Badge :value="page" />
        <a
          :href="pdfUrl + '#page=' + page"
          target="_blank"
          class="mr-2 text-primary hover:text-primary-600"
        >
          <i class="pi pi-eye" />
        </a>
      </div>
    </template>

    <template #content>
      <div class="relative">
        <div
          ref="textContainer"
          class="slim-scrollbar overflow-y-auto overflow-x-hidden whitespace-pre-line leading-relaxed text-gray-700 transition-all duration-300 dark:text-gray-300"
          :style="{ maxHeight: expanded ? '500px' : maxHeight }"
          v-html="highlightText(text, search)"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between">
        <div>
          <Button
            v-if="
              textContainer &&
              textContainer.scrollHeight > textContainer.clientHeight
            "
            @click="toggleHeight"
            text
            rounded
            size="small"
            :icon="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            class="text-primary hover:text-primary-600"
            aria-label="Toggle height"
          />
        </div>

        <Button
          icon="pi pi-copy"
          text
          rounded
          size="small"
          aria-label="Copy"
          class="text-gray-400 hover:text-primary"
          @click="copyText(text)"
        />
      </div>
    </template>
  </Card>
</template>

<style>
/* TODO: Put in a global utils place */
.slim-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.slim-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 4px;
}

.slim-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.p-card-body {
  padding: 0 !important;
}
</style>
