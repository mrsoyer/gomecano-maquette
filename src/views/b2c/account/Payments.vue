<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user.store'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import Container from '@/components/layout/Container.vue'
import PaymentMethodCard from '@/components/payment/PaymentMethodCard.vue'
import InvoiceCard from '@/components/payment/InvoiceCard.vue'
import AddPaymentMethodForm from '@/components/payment/AddPaymentMethodForm.vue'

const router = useRouter()
const userStore = useUserStore()

// Auto-login user for demo
onMounted(async () => {
  if (!userStore.isAuthenticated) {
    await userStore.loginById('user-1')
  }
})

// Mock data - Payment methods
const paymentMethods = ref([
  {
    id: '1',
    type: 'card' as const,
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    holderName: 'Jean Dupont'
  },
  {
    id: '2',
    type: 'card' as const,
    last4: '5555',
    brand: 'Mastercard',
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false,
    holderName: 'Jean Dupont'
  }
])

// Mock data - Invoices
const invoices = ref([
  {
    id: 'INV-2024-001',
    date: '2024-03-15',
    amount: 189.90,
    status: 'paid' as const,
    service: 'Vidange complète',
    downloadUrl: '#'
  },
  {
    id: 'INV-2024-002',
    date: '2024-02-10',
    amount: 349.00,
    status: 'paid' as const,
    service: 'Changement de freins',
    downloadUrl: '#'
  },
  {
    id: 'INV-2024-003',
    date: '2024-01-20',
    amount: 149.90,
    status: 'pending' as const,
    service: 'Diagnostic électronique',
    downloadUrl: '#'
  }
])

// State
const isAddMethodModalOpen = ref(false)
const activeTab = ref<'methods' | 'invoices'>('methods')

// Computed
const totalSpent = computed(() => {
  return invoices.value
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0)
})

const pendingAmount = computed(() => {
  return invoices.value
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0)
})

/**
 * Set payment method as default
 */
function handleSetDefault(methodId: string): void {
  paymentMethods.value = paymentMethods.value.map(method => ({
    ...method,
    isDefault: method.id === methodId
  }))
}

/**
 * Delete payment method
 */
function handleDeleteMethod(methodId: string): void {
  const method = paymentMethods.value.find(m => m.id === methodId)
  if (method?.isDefault && paymentMethods.value.length > 1) {
    alert('Impossible de supprimer le moyen de paiement par défaut. Définissez-en un autre d\'abord.')
    return
  }
  
  paymentMethods.value = paymentMethods.value.filter(m => m.id !== methodId)
}

/**
 * Add new payment method
 */
function handleAddMethod(method: any): void {
  const newMethod = {
    id: Date.now().toString(),
    type: 'card' as const,
    last4: method.cardNumber.slice(-4),
    brand: method.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
    expiryMonth: parseInt(method.expiryMonth),
    expiryYear: parseInt(method.expiryYear),
    isDefault: paymentMethods.value.length === 0,
    holderName: method.holderName
  }
  
  paymentMethods.value.push(newMethod)
  isAddMethodModalOpen.value = false
}

/**
 * Download invoice
 */
function handleDownloadInvoice(invoiceId: string): void {
  console.log('Download invoice:', invoiceId)
  // Mock download
  alert(`Téléchargement de la facture ${invoiceId}`)
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
        <span class="text-gray-900 font-medium">Paiements & Factures</span>
      </nav>

      <!-- Header -->
      <div class="mb-4 md:mb-6">
        <h1 class="text-2xl font-bold text-gray-900 md:text-3xl">
          Paiements & Factures
        </h1>
        <p class="mt-1 text-sm text-gray-600 md:text-base">
          Gérez vos moyens de paiement et consultez vos factures
        </p>
      </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
      <!-- Total spent -->
      <div class="p-4 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total dépensé</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ totalSpent.toFixed(2) }}€
            </p>
          </div>
          <div class="p-3 bg-green-pale rounded-lg">
            <Icon icon="mdi:cash-check" class="w-6 h-6 text-green-primary" />
          </div>
        </div>
      </div>

      <!-- Pending -->
      <div class="p-4 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">En attente</p>
            <p class="text-2xl font-bold text-orange-primary">
              {{ pendingAmount.toFixed(2) }}€
            </p>
          </div>
          <div class="p-3 bg-orange-light rounded-lg">
            <Icon icon="mdi:clock-outline" class="w-6 h-6 text-orange-primary" />
          </div>
        </div>
      </div>

      <!-- Payment methods -->
      <div class="p-4 bg-white border border-gray-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Moyens de paiement</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ paymentMethods.length }}
            </p>
          </div>
          <div class="p-3 bg-blue-pale rounded-lg">
            <Icon icon="mdi:credit-card" class="w-6 h-6 text-blue-primary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="flex gap-4 md:gap-6">
        <button
          type="button"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'methods'
              ? 'border-blue-primary text-blue-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          ]"
          @click="activeTab = 'methods'"
        >
          Moyens de paiement
        </button>
        <button
          type="button"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'invoices'
              ? 'border-blue-primary text-blue-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          ]"
          @click="activeTab = 'invoices'"
        >
          Factures ({{ invoices.length }})
        </button>
      </nav>
    </div>

    <!-- Payment Methods Tab -->
    <div v-if="activeTab === 'methods'" class="space-y-4">
      <!-- Add button -->
      <div class="flex justify-end">
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-primary rounded-lg hover:bg-blue-dark transition-colors"
          @click="isAddMethodModalOpen = true"
        >
          <Icon icon="mdi:plus" class="w-5 h-5" />
          Ajouter un moyen de paiement
        </button>
      </div>

      <!-- Payment methods list -->
      <div v-if="paymentMethods.length > 0" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <PaymentMethodCard
          v-for="method in paymentMethods"
          :key="method.id"
          :method="method"
          @set-default="handleSetDefault"
          @delete="handleDeleteMethod"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="p-8 text-center bg-white border border-gray-200 rounded-lg md:p-12">
        <Icon icon="mdi:credit-card-off" class="w-12 h-12 mx-auto text-gray-400 md:w-16 md:h-16" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">
          Aucun moyen de paiement
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Ajoutez une carte bancaire pour faciliter vos paiements
        </p>
        <button
          type="button"
          class="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-primary rounded-lg hover:bg-blue-dark transition-colors"
          @click="isAddMethodModalOpen = true"
        >
          Ajouter une carte
        </button>
      </div>

      <!-- Security info -->
      <div class="flex items-start gap-3 p-4 bg-blue-pale rounded-lg">
        <Icon icon="mdi:shield-check" class="flex-shrink-0 w-5 h-5 text-blue-primary" />
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            Paiements sécurisés par Stripe
          </p>
          <p class="mt-1 text-xs text-gray-600">
            Vos informations bancaires sont cryptées et stockées de manière sécurisée. 
            Nous ne conservons pas vos données de carte complètes.
          </p>
        </div>
      </div>
    </div>

    <!-- Invoices Tab -->
    <div v-if="activeTab === 'invoices'" class="space-y-3">
      <!-- Invoices list -->
      <div v-if="invoices.length > 0" class="space-y-3">
        <InvoiceCard
          v-for="invoice in invoices"
          :key="invoice.id"
          :invoice="invoice"
          @download="handleDownloadInvoice"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="p-8 text-center bg-white border border-gray-200 rounded-lg md:p-12">
        <Icon icon="mdi:file-document-outline" class="w-12 h-12 mx-auto text-gray-400 md:w-16 md:h-16" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">
          Aucune facture
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Vos factures apparaîtront ici après vos interventions
        </p>
      </div>
    </div>

      <!-- Add Payment Method Modal -->
      <AddPaymentMethodForm
        :is-open="isAddMethodModalOpen"
        @close="isAddMethodModalOpen = false"
        @add="handleAddMethod"
      />
    </Container>

    <Footer />
  </div>
</template>
