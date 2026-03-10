import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { Tables, TablesInsert, TablesUpdate, VehicleWithMake } from '@/types/database.types'
import type { VehicleSummary } from '@/types/composables.types'

type Vehicle = Tables<'vehicles'>
type VehicleInsert = TablesInsert<'vehicles'>
type VehicleUpdate = TablesUpdate<'vehicles'>

/**
 * Composable for vehicle management with Supabase
 */
export function useVehicles() {
  const vehicles = ref<VehicleWithMake[]>([])
  const currentVehicle = ref<VehicleWithMake | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const primaryVehicle = computed(() =>
    vehicles.value.find(v => v.is_primary) || vehicles.value[0]
  )

  const vehicleSummaries = computed<VehicleSummary[]>(() =>
    vehicles.value.map(v => ({
      id: v.id,
      displayName: `${v.make_name || v.make?.name} ${v.model_name} (${v.plate})`,
      makeName: v.make_name || v.make?.name || '',
      modelName: v.model_name || '',
      plate: v.plate || '',
      year: v.year || 0,
      mileage: v.mileage || undefined,
      isPrimary: v.is_primary || false
    }))
  )

  /**
   * Fetch all vehicles for current user
   */
  async function fetchVehicles() {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select(`
          *,
          make:vehicle_makes(*),
          model:vehicle_models(*)
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      vehicles.value = data as VehicleWithMake[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch vehicles'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single vehicle by ID
   */
  async function fetchVehicle(vehicleId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('vehicles')
        .select(`
          *,
          make:vehicle_makes(*),
          model:vehicle_models(*),
          documents:vehicle_documents(*),
          reminders:maintenance_reminders(*)
        `)
        .eq('id', vehicleId)
        .single()

      if (fetchError) throw fetchError

      currentVehicle.value = data as VehicleWithMake
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch vehicle'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Add a new vehicle
   */
  async function addVehicle(vehicle: Omit<VehicleInsert, 'owner_id'>) {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // If this is the first vehicle, make it primary
      const isPrimary = vehicles.value.length === 0 || vehicle.is_primary

      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          ...vehicle,
          owner_id: user.id,
          is_primary: isPrimary
        })
        .select(`
          *,
          make:vehicle_makes(*),
          model:vehicle_models(*)
        `)
        .single()

      if (insertError) throw insertError

      // If new vehicle is primary, update others
      if (isPrimary) {
        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('owner_id', user.id)
          .neq('id', data.id)
      }

      vehicles.value = [data as VehicleWithMake, ...vehicles.value.filter(v => v.id !== data.id)]
      return { success: true, vehicle: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add vehicle'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a vehicle
   */
  async function updateVehicle(vehicleId: string, updates: VehicleUpdate) {
    try {
      const { data, error: updateError } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .select(`
          *,
          make:vehicle_makes(*),
          model:vehicle_models(*)
        `)
        .single()

      if (updateError) throw updateError

      vehicles.value = vehicles.value.map(v =>
        v.id === vehicleId ? (data as VehicleWithMake) : v
      )

      if (currentVehicle.value?.id === vehicleId) {
        currentVehicle.value = data as VehicleWithMake
      }

      return { success: true, vehicle: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update vehicle'
      return { success: false, error: error.value }
    }
  }

  /**
   * Delete a vehicle (soft delete)
   */
  async function deleteVehicle(vehicleId: string) {
    try {
      const { error: deleteError } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('id', vehicleId)

      if (deleteError) throw deleteError

      vehicles.value = vehicles.value.filter(v => v.id !== vehicleId)

      if (currentVehicle.value?.id === vehicleId) {
        currentVehicle.value = null
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete vehicle'
      return { success: false, error: error.value }
    }
  }

  /**
   * Set a vehicle as primary
   */
  async function setPrimary(vehicleId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update all vehicles
      await supabase
        .from('vehicles')
        .update({ is_primary: false })
        .eq('owner_id', user.id)

      await supabase
        .from('vehicles')
        .update({ is_primary: true })
        .eq('id', vehicleId)

      vehicles.value = vehicles.value.map(v => ({
        ...v,
        is_primary: v.id === vehicleId
      }))

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to set primary'
      return { success: false, error: error.value }
    }
  }

  /**
   * Lookup vehicle by plate (via API SIV)
   */
  async function lookupByPlate(plate: string) {
    // TODO: Implement via Edge Function calling API SIV
    // For now, return mock data
    return {
      success: true,
      vehicle: {
        plate,
        makeName: 'Renault',
        modelName: 'Clio',
        year: 2020,
        fuelType: 'essence'
      }
    }
  }

  return {
    vehicles,
    currentVehicle,
    primaryVehicle,
    vehicleSummaries,
    loading,
    error,
    fetchVehicles,
    fetchVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setPrimary,
    lookupByPlate
  }
}
