import * as pdfjsLib from 'pdfjs-dist'

interface UsePDFjsOptions {
  file: MaybeRef<File | undefined>
}

export const usePDFjs = (options: UsePDFjsOptions) => {
  const { file: rawFile } = options

  ;(() => {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/' +
        `pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
    } catch (e) {
      console.warn(
        'Failed to load PDF.js worker from CDN, using local version',
        e
      )
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    }
  })()

  const file = computed(() => unref(rawFile))

  const pdfUrl = computed(() => {
    if (!file.value) return undefined
    return URL.createObjectURL(file.value)
  })

  const arrayBuffer = computedAsync(async () => {
    if (!file.value) return undefined
    return await file.value.arrayBuffer()
  })

  const uploadProgress = ref(0)
  const totalPages = ref(0)
  const processedPages = ref<
    {
      page: number
      text: string
    }[]
  >([])

  const resetState = () => {
    processedPages.value = []
    uploadProgress.value = 0
    totalPages.value = 0
  }

  const loadingPercentage = computed(() => {
    if (!totalPages.value) return 0
    return Math.round((uploadProgress.value / totalPages.value) * 100)
  })

  const isLoading = computed(() => {
    return loadingPercentage.value > 0 && loadingPercentage.value < 100
  })

  const processPages = async (pdfDocument: pdfjsLib.PDFDocumentProxy) => {
    try {
      const actualPageCount = pdfDocument.numPages
      processedPages.value = []
      uploadProgress.value = 0

      for (let i = 0; i < actualPageCount; i++) {
        const pageNumber = i + 1

        try {
          const pdfPage = await pdfDocument.getPage(pageNumber)
          const textContent = await pdfPage.getTextContent()

          const text = textContent.items
            .filter((item) => 'str' in item)
            .map((item) => item.str)
            .join(' ')

          processedPages.value.push({ page: pageNumber, text })
          uploadProgress.value++
        } catch (error) {
          console.error(`Error processing page ${pageNumber}:`, error)
          processedPages.value.push({ page: pageNumber, text: '' })
          uploadProgress.value++
        }
      }
    } catch (error) {
      console.error('Error in processPages:', error)
    }
  }

  watchEffect(async () => {
    resetState()

    try {
      if (!file.value || !arrayBuffer.value) {
        return
      }

      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer.value,
        disableStream: true,
        disableAutoFetch: true,
      })

      loadingTask.onProgress = ({
        loaded,
        total,
      }: {
        loaded: number
        total: number
      }) => {
        if (totalPages.value === 0) {
          uploadProgress.value = Math.round((loaded / total) * 100)
        }
      }

      const pdfDocument = await loadingTask.promise
      totalPages.value = pdfDocument.numPages
      uploadProgress.value = 0

      await processPages(pdfDocument)
    } catch (error) {
      console.error('Error loading PDF:', error)
      resetState()
    }
  })

  return {
    pdfUrl,
    processedPages,
    loadingPercentage,
    isLoading,
    totalPages,
  }
}
