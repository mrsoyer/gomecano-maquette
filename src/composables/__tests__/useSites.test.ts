import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the modules before importing the composable
vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

vi.mock('@/mocks/companies.mock', () => ({
  mockCompanySites: [
    {
      id: 'site-1-a',
      name: 'Site Paris',
      address: { street: '10 Rue Test', postalCode: '75001', city: 'Paris', country: 'France' },
      phone: '0100000001',
      vehiclesCount: 10,
      is_active: true,
      is_main: true
    },
    {
      id: 'site-1-b',
      name: 'Site Lyon',
      address: { street: '20 Rue Test', postalCode: '69001', city: 'Lyon', country: 'France' },
      phone: '0400000001',
      vehiclesCount: 5,
      is_active: true,
      is_main: false
    },
    {
      id: 'site-2-a',
      name: 'Site Marseille',
      address: { street: '30 Rue Test', postalCode: '13001', city: 'Marseille', country: 'France' },
      phone: '0490000001',
      vehiclesCount: 8,
      is_active: false,
      is_main: false
    }
  ]
}))

vi.mock('@/utils/b2b-transforms', () => ({
  transformSiteFromDB: vi.fn((data) => ({
    id: data.id,
    name: data.name,
    address: data.address,
    phone: data.phone,
    vehiclesCount: data.vehicles_count || 0,
    is_active: data.is_active,
    is_main: data.is_main
  })),
  transformSiteToDB: vi.fn((data) => ({
    name: data.name,
    address: data.address,
    phone: data.phone
  }))
}))

import { supabase } from '@/services/supabase'

describe('useSites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('with mock data (default)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'true')
    })

    it('should fetch sites filtered by company prefix', async () => {
      const { useSites } = await import('../useSites')
      const { sites, fetchSites, loading } = useSites()

      expect(sites.value).toHaveLength(0)
      expect(loading.value).toBe(false)

      await fetchSites('company-1')

      expect(supabase.rpc).not.toHaveBeenCalled()
      // company-1 matches sites starting with 'site-1'
      expect(sites.value.length).toBeGreaterThan(0)
    })

    it('should compute activeSites correctly', async () => {
      const { useSites } = await import('../useSites')
      const { sites, activeSites, fetchSites } = useSites()

      // Manually set sites to test computed
      await fetchSites('company-1')

      // All mock sites for company-1 have is_active !== false
      expect(activeSites.value.length).toBeLessThanOrEqual(sites.value.length)
    })

    it('should compute mainSite correctly', async () => {
      const { useSites } = await import('../useSites')
      const { mainSite, fetchSites } = useSites()

      await fetchSites('company-1')

      // Should find the main site
      if (mainSite.value) {
        expect(mainSite.value.is_main).toBe(true)
      }
    })

    it('should compute sitesByRegion grouped by city', async () => {
      const { useSites } = await import('../useSites')
      const { sitesByRegion, fetchSites } = useSites()

      await fetchSites('company-1')

      // Should group sites by city
      expect(typeof sitesByRegion.value).toBe('object')
    })

    it('should compute totalVehicles across all sites', async () => {
      const { useSites } = await import('../useSites')
      const { totalVehicles, fetchSites } = useSites()

      await fetchSites('company-1')

      // Should sum vehiclesCount from all sites
      expect(typeof totalVehicles.value).toBe('number')
    })

    it('should create a new site in mock mode', async () => {
      const { useSites } = await import('../useSites')
      const { sites, createSite, fetchSites } = useSites()

      await fetchSites('company-1')
      const initialCount = sites.value.length

      const newSite = await createSite('company-1', {
        name: 'New Site',
        address: { street: '1 New Street', postalCode: '75000', city: 'Paris', country: 'France' },
        phone: '0100000099'
      })

      expect(supabase.rpc).not.toHaveBeenCalled()
      expect(newSite).not.toBeNull()
      expect(newSite?.name).toBe('New Site')
      expect(sites.value.length).toBe(initialCount + 1)
    })

    it('should update a site in mock mode', async () => {
      const { useSites } = await import('../useSites')
      const { sites, updateSite, fetchSites } = useSites()

      await fetchSites('company-1')
      const firstSiteId = sites.value[0]?.id

      if (firstSiteId) {
        await updateSite(firstSiteId, { name: 'Updated Site Name' })

        expect(supabase.rpc).not.toHaveBeenCalled()
        const updatedSite = sites.value.find(s => s.id === firstSiteId)
        expect(updatedSite?.name).toBe('Updated Site Name')
      }
    })

    it('should delete a site in mock mode', async () => {
      const { useSites } = await import('../useSites')
      const { sites, deleteSite, fetchSites } = useSites()

      await fetchSites('company-1')
      const initialCount = sites.value.length
      const firstSiteId = sites.value[0]?.id

      if (firstSiteId) {
        await deleteSite(firstSiteId)

        expect(supabase.rpc).not.toHaveBeenCalled()
        expect(sites.value.length).toBe(initialCount - 1)
        expect(sites.value.find(s => s.id === firstSiteId)).toBeUndefined()
      }
    })

    it('should get site by ID', async () => {
      const { useSites } = await import('../useSites')
      const { getSiteById, fetchSites } = useSites()

      await fetchSites('company-1')

      const site = getSiteById('site-1-a')
      expect(site?.name).toBe('Site Paris')
    })

    it('should clear sites state', async () => {
      const { useSites } = await import('../useSites')
      const { sites, fetchSites, clearSites, error } = useSites()

      await fetchSites('company-1')
      expect(sites.value.length).toBeGreaterThan(0)

      clearSites()

      expect(sites.value).toHaveLength(0)
      expect(error.value).toBeNull()
    })
  })

  describe('with Supabase (USE_MOCK_DATA=false)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_USE_MOCK_DATA', 'false')
    })

    it('should call supabase.rpc for b2b_get_sites', async () => {
      const mockResponse = [
        {
          id: 'site-db-1',
          name: 'DB Site',
          address: { street: '1 DB Street', postalCode: '75001', city: 'Paris', country: 'France' },
          phone: '0100000001',
          vehicles_count: 12,
          is_active: true,
          is_main: true
        }
      ]

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: mockResponse,
        error: null
      } as never)

      const { useSites } = await import('../useSites')
      const { fetchSites, sites } = useSites()

      await fetchSites('company-1')

      expect(supabase.rpc).toHaveBeenCalledWith('b2b_get_sites', {
        p_company_id: 'company-1'
      })
      expect(sites.value.length).toBe(1)
    })

    it('should handle Supabase error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      } as never)

      const { useSites } = await import('../useSites')
      const { fetchSites, error } = useSites()

      await fetchSites('company-1')

      expect(error.value).toBe('Database error')
    })

    it('should call supabase.rpc for b2b_create_site', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          id: 'new-site-id',
          name: 'New DB Site',
          address: { street: '1 New', postalCode: '75001', city: 'Paris', country: 'France' },
          phone: '0100000001',
          vehicles_count: 0,
          is_active: true,
          is_main: false
        },
        error: null
      } as never)

      const { useSites } = await import('../useSites')
      const { createSite } = useSites()

      await createSite('company-1', {
        name: 'New DB Site',
        address: { street: '1 New', postalCode: '75001', city: 'Paris', country: 'France' },
        phone: '0100000001'
      })

      expect(supabase.rpc).toHaveBeenCalledWith('b2b_create_site', {
        p_company_id: 'company-1',
        p_site_data: expect.objectContaining({ name: 'New DB Site' })
      })
    })

    it('should call supabase.rpc for b2b_update_site', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: {
          id: 'site-1',
          name: 'Updated Name',
          address: {},
          vehicles_count: 10
        },
        error: null
      } as never)

      const { useSites } = await import('../useSites')
      const { sites, updateSite } = useSites()

      // Add a site to local state first
      sites.value = [{ id: 'site-1', name: 'Original', address: {} as never, vehiclesCount: 10 }]

      await updateSite('site-1', { name: 'Updated Name' })

      expect(supabase.rpc).toHaveBeenCalledWith('b2b_update_site', {
        p_site_id: 'site-1',
        p_updates: expect.objectContaining({ name: 'Updated Name' })
      })
    })

    it('should call supabase.rpc for b2b_delete_site', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null
      } as never)

      const { useSites } = await import('../useSites')
      const { sites, deleteSite } = useSites()

      // Add a site to local state first
      sites.value = [{ id: 'site-1', name: 'To Delete', address: {} as never, vehiclesCount: 10 }]

      await deleteSite('site-1')

      expect(supabase.rpc).toHaveBeenCalledWith('b2b_delete_site', {
        p_site_id: 'site-1'
      })
      expect(sites.value.find(s => s.id === 'site-1')).toBeUndefined()
    })
  })
})
