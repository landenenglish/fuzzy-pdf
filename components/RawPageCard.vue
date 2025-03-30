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

const toggleHeight = () => {
  expanded.value = !expanded.value
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
}

const highlightedText = highlightText(
  () => text,
  () => search ?? ''
)

const { templateRef: textContainer } = useScrollToHighestDensity({
  templateRefName: 'textContainer',
  selector: '.highlight-match',
  watchSources: [() => search, () => expanded],
})
</script>

<template>
  <Card
    class="mb-4 w-full overflow-hidden border-0 p-2 shadow-sm hover:shadow-md"
  >
    <template #title>
      <div class="flex items-center justify-between">
        <span class="text-sm text-primary">Page {{ page }}</span>
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
          v-html="highlightedText"
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
