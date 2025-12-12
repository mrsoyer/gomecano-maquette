<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import { useInterventionStore } from '@/stores/intervention.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'

const router = useRouter()
const userStore = useUserStore()
const interventionStore = useInterventionStore()

// State
const selectedType = ref<'all' | 'invoice' | 'contract' | 'quote' | 'report'>('all')

// Mock documents
const documents = ref([
  {
    id: 'doc-1',
    type: 'invoice' as const,
    name: 'Facture INV-2024-001',
    description: 'Vidange complète - Peugeot 308',
    date: '2024-03-15',
    size: '245 KB',
    url: '#'
  },
  {
    id: 'doc-2',
    type: 'invoice' as const,
    name: 'Facture INV-2024-002',
    description: 'Changement de freins - Peugeot 308',
    date: '2024-02-10',
    size: '312 KB',
    url: '#'
  },
  {
    id: 'doc-3',
    type: 'contract' as const,
    name: 'Contrat de maintenance',
    description: 'Contrat annuel véhicule Peugeot 308',
    date: '2024-01-15',
    size: '1.2 MB',
    url: '#'
  },
  {
    id: 'doc-4',
    type: 'quote' as const,
    name: 'Devis changement courroie',
    description: 'Devis pour intervention prévue',
    date: '2024-03-20',
    size: '189 KB',
    url: '#'
  },
  {
    id: 'doc-5',
    type: 'report' as const,
    name: 'Rapport d\'intervention vidange',
    description: 'Compte-rendu détaillé intervention',
    date: '2024-03-15',
    size: '567 KB',
    url: '#'
  }
])

// Auto-login user for demo
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
})

// Computed
const filteredDocuments = computed(() => {
  if (selectedType.value === 'all') {
    return documents.value
  }
  return documents.value.filter(doc => doc.type === selectedType.value)
})

const documentsByType = computed(() => {
  return {
    all: documents.value.length,
    invoice: documents.value.filter(d => d.type === 'invoice').length,
    contract: documents.value.filter(d => d.type === 'contract').length,
    quote: documents.value.filter(d => d.type === 'quote').length,
    report: documents.value.filter(d => d.type === 'report').length
  }
})

/**
 * Get document type config
 */
function getDocTypeConfig(type: string) {
  const configs = {
    invoice: {
      icon: 'mdi:receipt-text',
      label: 'Facture',
      color: 'text-green-primary',
      bgColor: 'bg-green-pale'
    },
    contract: {
      icon: 'mdi:file-document-edit',
      label: 'Contrat',
      color: 'text-blue-primary',
      bgColor: 'bg-blue-pale'
    },
    quote: {
      icon: 'mdi:file-document-outline',
      label: 'Devis',
      color: 'text-orange-primary',
      bgColor: 'bg-orange-light'
    },
    report: {
      icon: 'mdi:clipboard-text',
      label: 'Rapport',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  }
  return configs[type] || configs.invoice
}

/**
 * Download document
 */
function handleDownload(docId: string): void {
  const doc = documents.value.find(d => d.id === docId)
  if (doc) {
    console.log('Download:', doc.name)
    alert(`Téléchargement de ${doc.name}`)
  }
}

/**
 * Download all documents
 */
function handleDownloadAll(): void {
  alert('Téléchargement de tous les documents en cours...\n\nEn production: génération d\'une archive ZIP')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <Container class="py-4 md:py-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm mb-4">
        <router-link
          to="/account/dashboard"
          class="text-gray-600 hover:text-blue-primary transition-colors"
        >
          Mon compte
        </router-link>
        <Icon icon="mdi:chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-900 font-medium">Documents</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-3 mb-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 md:text-3xl">
            Mes documents
          </h1>
          <p class="mt-1 text-sm text-gray-600 md:text-base">
            Accédez à toutes vos factures, contrats et rapports d'intervention
          </p>
        </div>

        <!-- Download all -->
        <button
          v-if="documents.length > 0"
          type="button"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-primary rounded-lg hover:bg-blue-dark transition-colors"
          @click="handleDownloadAll"
        >
          <Icon icon="mdi:download-multiple" class="w-5 h-5" />
          Tout télécharger
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-4 bg-white border border-gray-200 rounded-lg p-3">
        <div class="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
              selectedType === 'all'
                ? 'bg-blue-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedType = 'all'"
          >
            <Icon icon="mdi:file-multiple" class="w-4 h-4" />
            Tous ({{ documentsByType.all }})
          </button>

          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
              selectedType === 'invoice'
                ? 'bg-blue-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedType = 'invoice'"
          >
            <Icon icon="mdi:receipt-text" class="w-4 h-4" />
            Factures ({{ documentsByType.invoice }})
          </button>

          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
              selectedType === 'contract'
                ? 'bg-blue-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedType = 'contract'"
          >
            <Icon icon="mdi:file-document-edit" class="w-4 h-4" />
            Contrats ({{ documentsByType.contract }})
          </button>

          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
              selectedType === 'quote'
                ? 'bg-blue-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedType = 'quote'"
          >
            <Icon icon="mdi:file-document-outline" class="w-4 h-4" />
            Devis ({{ documentsByType.quote }})
          </button>

          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all',
              selectedType === 'report'
                ? 'bg-blue-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectedType = 'report'"
          >
            <Icon icon="mdi:clipboard-text" class="w-4 h-4" />
            Rapports ({{ documentsByType.report }})
          </button>
        </div>
      </div>

      <!-- Documents list -->
      <div v-if="filteredDocuments.length > 0" class="space-y-3">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <!-- Icon -->
            <div
              :class="[
                'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
                getDocTypeConfig(doc.type).bgColor
              ]"
            >
              <Icon
                :icon="getDocTypeConfig(doc.type).icon"
                :class="['w-6 h-6', getDocTypeConfig(doc.type).color]"
              />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2 mb-1">
                <h3 class="font-medium text-gray-900">
                  {{ doc.name }}
                </h3>
                <span
                  :class="[
                    'px-2 py-0.5 text-xs font-medium rounded',
                    getDocTypeConfig(doc.type).bgColor,
                    getDocTypeConfig(doc.type).color
                  ]"
                >
                  {{ getDocTypeConfig(doc.type).label }}
                </span>
              </div>

              <p class="text-sm text-gray-600 mb-1">
                {{ doc.description }}
              </p>

              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <Icon icon="mdi:calendar" class="w-3 h-3" />
                  {{ new Date(doc.date).toLocaleDateString('fr-FR') }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon icon="mdi:file" class="w-3 h-3" />
                  {{ doc.size }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="p-2 text-blue-primary hover:bg-blue-pale rounded-lg transition-colors"
                title="Télécharger"
                @click="handleDownload(doc.id)"
              >
                <Icon icon="mdi:download" class="w-5 h-5" />
              </button>

              <a
                :href="doc.url"
                target="_blank"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voir"
              >
                <Icon icon="mdi:eye" class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="p-8 text-center bg-white border border-gray-200 rounded-lg md:p-12">
        <Icon icon="mdi:file-document-outline" class="w-12 h-12 mx-auto text-gray-400 md:w-16 md:h-16" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">
          Aucun document
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          {{ selectedType === 'all' 
            ? 'Vos documents apparaîtront ici après vos interventions.' 
            : `Aucun document de type "${getDocTypeConfig(selectedType).label}" disponible.` 
          }}
        </p>
        <button
          v-if="selectedType !== 'all'"
          type="button"
          class="mt-4 px-4 py-2 text-sm font-medium text-blue-primary hover:underline"
          @click="selectedType = 'all'"
        >
          Voir tous les documents
        </button>
      </div>

      <!-- Info banner -->
      <div class="mt-6 flex items-start gap-3 p-4 bg-blue-pale rounded-lg">
        <Icon icon="mdi:information" class="flex-shrink-0 w-5 h-5 text-blue-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            Conservation des documents
          </p>
          <p class="mt-1 text-xs text-gray-600">
            Tous vos documents sont conservés pendant 10 ans et accessibles à tout moment. 
            Vous pouvez les télécharger au format PDF pour les archiver localement.
          </p>
        </div>
      </div>
    </Container>

    <Footer />
  </div>
</template>
