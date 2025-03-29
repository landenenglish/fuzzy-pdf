<script setup lang="ts">
const { isDarkMode, toggleDarkMode } = useAppTheme()
</script>

<template>
  <button
    type="button"
    class="hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-900 dark:text-surface-0 focus-visible:outline-hidden focus-visible:ring-primary focus-visible:ring-offset-surface-0 dark:focus-visible:ring-offset-surface-950 flex h-10 w-10 items-center justify-center rounded-full transition-all focus-visible:ring-1 focus-visible:ring-offset-2"
    @click="toggleDarkMode"
  >
    <i
      :class="[
        'pi text-base',
        { 'pi-moon': isDarkMode, 'pi-sun': !isDarkMode },
      ]"
    />
  </button>
</template>
