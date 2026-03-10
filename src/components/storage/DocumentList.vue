<script setup lang="ts">
import type { UserDocument } from '@/types/storage.types'

interface Props {
  documents: UserDocument[]
  loading?: boolean
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  editable: false
})

const emit = defineEmits<{
  download: [document: UserDocument]
  delete: [document: UserDocument]
}>()

const documentTypeLabels: Record<string, string> = {
  invoice: 'Facture',
  quote: 'Devis',
  insurance: 'Assurance',
  registration: 'Carte grise',
  maintenance: 'Carnet entretien',
  other: 'Autre'
}

const documentTypeIcons: Record<string, string> = {
  invoice: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z',
  quote: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  insurance: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  registration: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
  maintenance: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  other: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="document-list">
    <!-- Loading -->
    <div v-if="loading" class="document-list__loading">
      <div v-for="i in 3" :key="i" class="document-list__skeleton" />
    </div>

    <!-- Empty -->
    <div v-else-if="documents.length === 0" class="document-list__empty">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
      <p>Aucun document</p>
    </div>

    <!-- Documents List -->
    <div v-else class="document-list__items">
      <div
        v-for="doc in documents"
        :key="doc.path"
        class="document-list__item"
      >
        <!-- Icon -->
        <div class="document-list__icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="documentTypeIcons[doc.type] || documentTypeIcons.other" />
          </svg>
        </div>

        <!-- Info -->
        <div class="document-list__info">
          <p class="document-list__name">{{ doc.displayName }}</p>
          <div class="document-list__meta">
            <span class="document-list__type">{{ documentTypeLabels[doc.type] }}</span>
            <span class="document-list__size">{{ formatSize(doc.size) }}</span>
            <span class="document-list__date">{{ formatDate(doc.createdAt) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="document-list__actions">
          <button
            class="document-list__action"
            title="Télécharger"
            @click="emit('download', doc)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <button
            v-if="editable"
            class="document-list__action document-list__action--delete"
            title="Supprimer"
            @click="emit('delete', doc)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.document-list {
  @apply space-y-2;
}

.document-list__loading {
  @apply space-y-2;
}

.document-list__skeleton {
  @apply h-16 bg-gray-200 rounded-lg animate-pulse;
}

.document-list__empty {
  @apply flex flex-col items-center justify-center py-8 text-gray-400;
}

.document-list__empty svg {
  @apply w-12 h-12 mb-2;
}

.document-list__items {
  @apply space-y-2;
}

.document-list__item {
  @apply flex items-center gap-4 p-4 bg-gray-50 rounded-lg;
  @apply hover:bg-gray-100 transition-colors;
}

.document-list__icon {
  @apply w-10 h-10 flex items-center justify-center bg-primary-100 rounded-lg flex-shrink-0;
}

.document-list__icon svg {
  @apply w-5 h-5 text-primary-600;
}

.document-list__info {
  @apply flex-1 min-w-0;
}

.document-list__name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.document-list__meta {
  @apply flex items-center gap-2 mt-1 text-xs text-gray-500;
}

.document-list__type {
  @apply px-2 py-0.5 bg-gray-200 rounded;
}

.document-list__actions {
  @apply flex items-center gap-1;
}

.document-list__action {
  @apply p-2 hover:bg-gray-200 rounded transition-colors;
}

.document-list__action svg {
  @apply w-5 h-5 text-gray-600;
}

.document-list__action--delete:hover {
  @apply bg-red-100;
}

.document-list__action--delete:hover svg {
  @apply text-red-600;
}
</style>
