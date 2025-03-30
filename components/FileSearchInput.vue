<script setup lang="ts">
const model = defineModel<string>({ required: true })

const input = ref(model.value)

watchDebounced(input, (value) => (model.value = value), { debounce: 300 })
</script>

<template>
  <Textarea
    v-model="input"
    placeholder="Search"
    class="file-search-input w-full max-w-2xl resize-none"
    rows="2"
  />
</template>
