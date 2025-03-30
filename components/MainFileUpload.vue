<script setup lang="ts">
import type { FileUploadUploaderEvent } from 'primevue'

const file = defineModel<File | undefined>({
  required: false,
  default: undefined,
})

const onUpload = (event: FileUploadUploaderEvent) => {
  const newFile = Array.isArray(event.files) ? event.files[0] : event.files

  if (newFile) {
    file.value = newFile
  }
}

const getFileNameWithoutExtension = (fileName: string) =>
  fileName.split('.').slice(0, -1).join('.')
</script>

<template>
  <div class="main-file-upload flex flex-col items-center justify-center">
    <FileUpload
      v-if="!file"
      @uploader="onUpload"
      accept="application/pdf"
      auto
      custom-upload
    >
      <template #header="{ chooseCallback }">
        <div class="flex flex-1 flex-wrap items-center justify-center">
          <Button
            @click="chooseCallback()"
            icon="pi pi-upload"
            rounded
            outlined
            severity="primary"
          ></Button>
        </div>
      </template>

      <template #empty>
        <span class="hidden sm:inline">Drag and drop a file to upload</span>
      </template>
    </FileUpload>

    <div
      v-else
      class="uploaded-file-card flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/30 bg-surface-50 p-4 dark:bg-surface-950"
    >
      <h2 class="text-lg">
        <span class="font-bold">{{
          getFileNameWithoutExtension(file.name)
        }}</span>
      </h2>
      <div class="flex gap-2">
        <Button
          icon="pi pi-trash"
          rounded
          severity="secondary"
          size="small"
          @click="file = undefined"
          aria-label="Change file"
        />
      </div>
    </div>
  </div>
</template>

<style>
.p-fileupload-header {
  @apply p-2;
}

.p-fileupload-content {
  @apply hidden min-h-[100px] items-center justify-center sm:flex;
}
</style>
