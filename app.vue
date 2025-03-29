<template>
  <NuxtRouteAnnouncer />

  <AppTopBar />

  <NuxtLayout>
    <ClientOnly>
      <NuxtPage />
    </ClientOnly>
  </NuxtLayout>
</template>
