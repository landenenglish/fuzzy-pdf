<template>
  <ClientOnly>
    <div class="flex items-center justify-between">
      <a
        :href="'https://github.com/landenenglish/fuzzy-pdf'"
        target="_blank"
        class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <i class="pi pi-github text-xl"></i>
      </a>
      <div class="flex items-center">
        <ThemeLightDark />
        <ThemePicker />
      </div>
    </div>
  </ClientOnly>
</template>
