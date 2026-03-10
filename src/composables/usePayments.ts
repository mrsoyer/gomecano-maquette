import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

interface PaymentMethod {
  id: string
  user_id: string
  type: 'card' | 'sepa'
  card_last4: string | null
  card_brand: string | null
  card_exp_month: number | null
  card_exp_year: number | null
  iban_last4: string | null
  bank_name: string | null
  is_default: boolean
  is_active: boolean
  stripe_payment_method_id: string | null
  created_at: string
  updated_at: string
}

interface InvoiceWithDetails {
  id: string
  invoice_number: string
  appointment_id: string
  client_id: string
  amount: number
  status: string
  pdf_url: string | null
  created_at: string
  appointment_scheduled_at: string | null
  service_name: string | null
}

/**
 * Composable for payment methods and invoices management
 *
 * Provides functionality to manage user payment methods and view invoices
 * Uses Supabase RPC functions with built-in RLS
 */
export function usePayments() {
  const paymentMethods = ref<PaymentMethod[]>([])
  const invoices = ref<InvoiceWithDetails[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const defaultPaymentMethod = computed(() =>
    paymentMethods.value.find(m => m.is_default) || paymentMethods.value[0]
  )

  const hasPaymentMethods = computed(() => paymentMethods.value.length > 0)

  /**
   * Fetch user's payment methods via RPC
   */
  async function fetchPaymentMethods(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_payment_methods')

      if (fetchError) throw fetchError
      paymentMethods.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch payment methods'
      console.error('Error fetching payment methods:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch user's invoices with appointment details via RPC
   */
  async function fetchInvoices(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .rpc('account_get_invoices')

      if (fetchError) throw fetchError
      invoices.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch invoices'
      console.error('Error fetching invoices:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Add a new payment method via RPC
   */
  async function addPaymentMethod(method: {
    type: 'card' | 'sepa'
    card_last4?: string
    card_brand?: string
    card_exp_month?: number
    card_exp_year?: number
    iban_last4?: string
    bank_name?: string
    is_default?: boolean
  }): Promise<PaymentMethod | null> {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .rpc('account_add_payment_method', {
          p_type: method.type,
          p_card_last4: method.card_last4 || null,
          p_card_brand: method.card_brand || null,
          p_card_exp_month: method.card_exp_month || null,
          p_card_exp_year: method.card_exp_year || null,
          p_iban_last4: method.iban_last4 || null,
          p_bank_name: method.bank_name || null,
          p_is_default: method.is_default || false
        })

      if (insertError) throw insertError

      // Refresh list
      await fetchPaymentMethods()

      return data as PaymentMethod
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add payment method'
      console.error('Error adding payment method:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Set a payment method as default via RPC
   */
  async function setDefaultPaymentMethod(methodId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .rpc('account_set_default_payment_method', {
          p_method_id: methodId
        })

      if (updateError) throw updateError

      // Refresh list
      await fetchPaymentMethods()

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to set default payment method'
      console.error('Error setting default payment method:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a payment method via RPC (soft delete)
   */
  async function deletePaymentMethod(methodId: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .rpc('account_delete_payment_method', {
          p_method_id: methodId
        })

      if (deleteError) throw deleteError

      // Refresh list
      await fetchPaymentMethods()

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete payment method'
      console.error('Error deleting payment method:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Download invoice PDF via Edge Function
   */
  async function downloadInvoice(invoiceId: string): Promise<string | null> {
    error.value = null

    try {
      // First check if we have a cached PDF URL
      const invoice = invoices.value.find(inv => inv.id === invoiceId)
      if (invoice?.pdf_url) {
        return invoice.pdf_url
      }

      // Generate PDF via Edge Function
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`
          },
          body: JSON.stringify({
            type: 'invoice',
            id: invoiceId,
            locale: 'fr-FR'
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate PDF')
      }

      const result = await response.json()

      // For now returns HTML preview, in production would return PDF URL
      return result.html || result.pdfUrl || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to download invoice'
      console.error('Error downloading invoice:', err)
      return null
    }
  }

  return {
    // State
    paymentMethods,
    invoices,
    loading,
    error,

    // Computed
    defaultPaymentMethod,
    hasPaymentMethods,

    // Methods
    fetchPaymentMethods,
    fetchInvoices,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    downloadInvoice
  }
}
