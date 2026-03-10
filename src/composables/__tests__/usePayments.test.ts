import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePayments } from '../usePayments'
import { supabase } from '@/services/supabase'

// Mock Supabase with RPC support
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn()
    }
  }
}))

// Mock fetch for Edge Function calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('usePayments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPaymentMethods', () => {
    it('should fetch user payment methods via RPC', async () => {
      const mockMethods = [
        {
          id: '1',
          user_id: 'user-1',
          type: 'card',
          card_last4: '4242',
          card_brand: 'visa',
          card_exp_month: 12,
          card_exp_year: 2025,
          iban_last4: null,
          bank_name: null,
          is_default: true,
          is_active: true,
          stripe_payment_method_id: 'pm_123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockMethods,
        error: null
      } as never)

      const { fetchPaymentMethods, paymentMethods, loading, error } = usePayments()

      expect(loading.value).toBe(false)

      await fetchPaymentMethods()

      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
      expect(paymentMethods.value).toEqual(mockMethods)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_payment_methods')
    })

    it('should handle fetch error gracefully', async () => {
      const mockError = { message: 'Database error', code: 'PGRST301' }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: mockError
      } as never)

      const { fetchPaymentMethods, error } = usePayments()

      await fetchPaymentMethods()

      expect(error.value).toBe('Failed to fetch payment methods')
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(supabase.rpc).mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ data: [], error: null } as never), 100)
        )
      )

      const { fetchPaymentMethods, loading } = usePayments()

      const fetchPromise = fetchPaymentMethods()
      expect(loading.value).toBe(true)

      await fetchPromise
      expect(loading.value).toBe(false)
    })
  })

  describe('fetchInvoices', () => {
    it('should fetch user invoices via RPC', async () => {
      const mockInvoices = [
        {
          id: 'inv-1',
          invoice_number: 'INV-2024-001',
          appointment_id: 'apt-1',
          client_id: 'user-1',
          amount: 150.00,
          status: 'paid',
          pdf_url: null,
          created_at: '2024-01-15T00:00:00Z',
          appointment_scheduled_at: '2024-01-10T10:00:00Z',
          service_name: 'Vidange'
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockInvoices,
        error: null
      } as never)

      const { fetchInvoices, invoices, error } = usePayments()

      await fetchInvoices()

      expect(error.value).toBe(null)
      expect(invoices.value).toEqual(mockInvoices)
      expect(supabase.rpc).toHaveBeenCalledWith('account_get_invoices')
    })

    it('should handle invoice fetch error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to load invoices' }
      } as never)

      const { fetchInvoices, error } = usePayments()

      await fetchInvoices()

      expect(error.value).toBe('Failed to fetch invoices')
    })
  })

  describe('defaultPaymentMethod', () => {
    it('should return the default payment method', async () => {
      const mockMethods = [
        { id: '1', type: 'card', is_default: false, is_active: true },
        { id: '2', type: 'sepa', is_default: true, is_active: true }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockMethods,
        error: null
      } as never)

      const { fetchPaymentMethods, defaultPaymentMethod } = usePayments()

      await fetchPaymentMethods()

      expect(defaultPaymentMethod.value).toEqual(mockMethods[1])
    })

    it('should return first method if no default', async () => {
      const mockMethods = [
        { id: '1', type: 'card', is_default: false, is_active: true },
        { id: '2', type: 'sepa', is_default: false, is_active: true }
      ]

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockMethods,
        error: null
      } as never)

      const { fetchPaymentMethods, defaultPaymentMethod } = usePayments()

      await fetchPaymentMethods()

      expect(defaultPaymentMethod.value).toEqual(mockMethods[0])
    })

    it('should return undefined when no methods exist', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { fetchPaymentMethods, defaultPaymentMethod } = usePayments()

      await fetchPaymentMethods()

      expect(defaultPaymentMethod.value).toBeUndefined()
    })
  })

  describe('hasPaymentMethods', () => {
    it('should return true when payment methods exist', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: '1', type: 'card' }],
        error: null
      } as never)

      const { fetchPaymentMethods, hasPaymentMethods } = usePayments()

      await fetchPaymentMethods()

      expect(hasPaymentMethods.value).toBe(true)
    })

    it('should return false when no payment methods', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { fetchPaymentMethods, hasPaymentMethods } = usePayments()

      await fetchPaymentMethods()

      expect(hasPaymentMethods.value).toBe(false)
    })
  })

  describe('addPaymentMethod', () => {
    it('should add a new card payment method via RPC', async () => {
      const newMethod = {
        type: 'card' as const,
        card_last4: '1234',
        card_brand: 'mastercard',
        card_exp_month: 6,
        card_exp_year: 2026,
        is_default: false
      }

      const returnedMethod = {
        id: '3',
        user_id: 'user-1',
        ...newMethod,
        iban_last4: null,
        bank_name: null,
        is_active: true,
        stripe_payment_method_id: 'pm_456',
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z'
      }

      // Mock addPaymentMethod RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: returnedMethod,
        error: null
      } as never)

      // Mock fetchPaymentMethods refresh
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [returnedMethod],
        error: null
      } as never)

      const { addPaymentMethod, paymentMethods } = usePayments()

      const result = await addPaymentMethod(newMethod)

      expect(result).toEqual(returnedMethod)
      expect(supabase.rpc).toHaveBeenCalledWith('account_add_payment_method', {
        p_type: 'card',
        p_card_last4: '1234',
        p_card_brand: 'mastercard',
        p_card_exp_month: 6,
        p_card_exp_year: 2026,
        p_iban_last4: null,
        p_bank_name: null,
        p_is_default: false
      })
      expect(paymentMethods.value).toHaveLength(1)
    })

    it('should add a new SEPA payment method via RPC', async () => {
      const newMethod = {
        type: 'sepa' as const,
        iban_last4: '7890',
        bank_name: 'BNP Paribas',
        is_default: true
      }

      const returnedMethod = {
        id: '4',
        user_id: 'user-1',
        type: 'sepa',
        card_last4: null,
        card_brand: null,
        card_exp_month: null,
        card_exp_year: null,
        iban_last4: '7890',
        bank_name: 'BNP Paribas',
        is_default: true,
        is_active: true,
        stripe_payment_method_id: 'pm_789',
        created_at: '2024-01-20T00:00:00Z',
        updated_at: '2024-01-20T00:00:00Z'
      }

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: returnedMethod,
        error: null
      } as never)

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [returnedMethod],
        error: null
      } as never)

      const { addPaymentMethod } = usePayments()

      const result = await addPaymentMethod(newMethod)

      expect(result).toEqual(returnedMethod)
      expect(supabase.rpc).toHaveBeenCalledWith('account_add_payment_method', {
        p_type: 'sepa',
        p_card_last4: null,
        p_card_brand: null,
        p_card_exp_month: null,
        p_card_exp_year: null,
        p_iban_last4: '7890',
        p_bank_name: 'BNP Paribas',
        p_is_default: true
      })
    })

    it('should handle add payment method error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid card data' }
      } as never)

      const { addPaymentMethod, error } = usePayments()

      const result = await addPaymentMethod({ type: 'card' })

      expect(result).toBeNull()
      expect(error.value).toBe('Failed to add payment method')
    })
  })

  describe('setDefaultPaymentMethod', () => {
    it('should set payment method as default via RPC', async () => {
      // Mock setDefault RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      // Mock refresh
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: '1', is_default: true }],
        error: null
      } as never)

      const { setDefaultPaymentMethod } = usePayments()

      const result = await setDefaultPaymentMethod('1')

      expect(result).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('account_set_default_payment_method', {
        p_method_id: '1'
      })
    })

    it('should handle set default error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Method not found' }
      } as never)

      const { setDefaultPaymentMethod, error } = usePayments()

      const result = await setDefaultPaymentMethod('invalid-id')

      expect(result).toBe(false)
      expect(error.value).toBe('Failed to set default payment method')
    })
  })

  describe('deletePaymentMethod', () => {
    it('should delete payment method via RPC (soft delete)', async () => {
      // Mock delete RPC call
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      } as never)

      // Mock refresh
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [],
        error: null
      } as never)

      const { deletePaymentMethod, paymentMethods } = usePayments()

      const result = await deletePaymentMethod('1')

      expect(result).toBe(true)
      expect(supabase.rpc).toHaveBeenCalledWith('account_delete_payment_method', {
        p_method_id: '1'
      })
      expect(paymentMethods.value).toHaveLength(0)
    })

    it('should handle delete error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot delete default method' }
      } as never)

      const { deletePaymentMethod, error } = usePayments()

      const result = await deletePaymentMethod('1')

      expect(result).toBe(false)
      expect(error.value).toBe('Failed to delete payment method')
    })
  })

  describe('downloadInvoice', () => {
    it('should return cached PDF URL if available', async () => {
      // First load invoices with a cached PDF URL
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{
          id: 'inv-1',
          invoice_number: 'INV-2024-001',
          pdf_url: 'https://storage.example.com/invoices/inv-1.pdf'
        }],
        error: null
      } as never)

      const { fetchInvoices, downloadInvoice } = usePayments()

      await fetchInvoices()

      const result = await downloadInvoice('inv-1')

      expect(result).toBe('https://storage.example.com/invoices/inv-1.pdf')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should call Edge Function when no cached PDF', async () => {
      // First load invoices without PDF URL
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{
          id: 'inv-2',
          invoice_number: 'INV-2024-002',
          pdf_url: null
        }],
        error: null
      } as never)

      // Mock auth session
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: {
            access_token: 'test-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: { id: 'user-1' }
          }
        },
        error: null
      } as never)

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ pdfUrl: 'https://storage.example.com/invoices/inv-2.pdf' })
      })

      const { fetchInvoices, downloadInvoice } = usePayments()

      await fetchInvoices()
      const result = await downloadInvoice('inv-2')

      expect(result).toBe('https://storage.example.com/invoices/inv-2.pdf')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/generate-pdf'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify({
            type: 'invoice',
            id: 'inv-2',
            locale: 'fr-FR'
          })
        })
      )
    })

    it('should handle Edge Function error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: 'inv-3', pdf_url: null }],
        error: null
      } as never)

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: { access_token: 'test-token' }
        },
        error: null
      } as never)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'PDF generation failed' })
      })

      const { fetchInvoices, downloadInvoice, error } = usePayments()

      await fetchInvoices()
      const result = await downloadInvoice('inv-3')

      expect(result).toBeNull()
      expect(error.value).toBe('PDF generation failed')
    })

    it('should handle missing auth session', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: [{ id: 'inv-4', pdf_url: null }],
        error: null
      } as never)

      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as never)

      const { fetchInvoices, downloadInvoice, error } = usePayments()

      await fetchInvoices()
      const result = await downloadInvoice('inv-4')

      expect(result).toBeNull()
      expect(error.value).toBe('Not authenticated')
    })
  })
})
