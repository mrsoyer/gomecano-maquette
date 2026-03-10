import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import type { Tables, TablesInsert, AppointmentWithRelations } from '@/types/database.types'
import type { AppointmentFilters } from '@/types/composables.types'

type Appointment = Tables<'appointments'>
type AppointmentInsert = TablesInsert<'appointments'>

/**
 * Composable for appointment management with Supabase
 */
export function useAppointmentsSupabase() {
  const appointments = ref<AppointmentWithRelations[]>([])
  const currentAppointment = ref<AppointmentWithRelations | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const upcomingAppointments = computed(() =>
    appointments.value
      .filter(a => ['pending', 'confirmed', 'assigned'].includes(a.status))
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  )

  const pastAppointments = computed(() =>
    appointments.value
      .filter(a => ['completed', 'cancelled'].includes(a.status))
      .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
  )

  /**
   * Fetch appointments with filters
   */
  async function fetchAppointments(filters?: AppointmentFilters) {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!client_id(*),
          mechanic:mechanics(*, profile:profiles(*)),
          vehicle:vehicles(*),
          service:services(*)
        `)
        .eq('client_id', user.id)
        .order('scheduled_date', { ascending: false })

      // Apply filters
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status)
        } else {
          query = query.eq('status', filters.status)
        }
      }

      if (filters?.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo)
      }

      if (filters?.vehicleId) {
        query = query.eq('vehicle_id', filters.vehicleId)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      appointments.value = data as AppointmentWithRelations[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch appointments'
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single appointment
   */
  async function fetchAppointment(appointmentId: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!client_id(*),
          mechanic:mechanics(*, profile:profiles(*)),
          vehicle:vehicles(*, make:vehicle_makes(*)),
          service:services(*),
          options:appointment_options(*, option:service_options(*)),
          answers:appointment_answers(*, question:service_questions(*)),
          modifications:booking_modifications(*)
        `)
        .eq('id', appointmentId)
        .single()

      if (fetchError) throw fetchError

      currentAppointment.value = data as AppointmentWithRelations
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch appointment'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new appointment
   */
  async function createAppointment(appointment: Omit<AppointmentInsert, 'client_id'>) {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('appointments')
        .insert({
          ...appointment,
          client_id: user.id,
          status: 'pending'
        })
        .select(`
          *,
          service:services(*),
          vehicle:vehicles(*)
        `)
        .single()

      if (insertError) throw insertError

      appointments.value = [data as AppointmentWithRelations, ...appointments.value]
      return { success: true, appointment: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create appointment'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancel an appointment
   */
  async function cancelAppointment(appointmentId: string, reason?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create modification record
      await supabase
        .from('booking_modifications')
        .insert({
          appointment_id: appointmentId,
          requested_by: user.id,
          modification_type: 'cancel',
          status: 'approved',
          reason
        })

      // Update appointment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          status_changed_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (updateError) throw updateError

      appointments.value = appointments.value.map(a =>
        a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
      )

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel appointment'
      return { success: false, error: error.value }
    }
  }

  /**
   * Reschedule an appointment
   */
  async function rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
    reason?: string
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const appointment = appointments.value.find(a => a.id === appointmentId)
      if (!appointment) throw new Error('Appointment not found')

      // Create modification record
      await supabase
        .from('booking_modifications')
        .insert({
          appointment_id: appointmentId,
          requested_by: user.id,
          modification_type: 'reschedule',
          status: 'approved',
          previous_data: {
            scheduled_date: appointment.scheduled_date,
            scheduled_time: appointment.scheduled_time
          },
          new_data: {
            scheduled_date: newDate,
            scheduled_time: newTime
          },
          reason
        })

      // Update appointment
      const { data, error: updateError } = await supabase
        .from('appointments')
        .update({
          scheduled_date: newDate,
          scheduled_time: newTime,
          status: 'pending'
        })
        .eq('id', appointmentId)
        .select()
        .single()

      if (updateError) throw updateError

      appointments.value = appointments.value.map(a =>
        a.id === appointmentId ? { ...a, ...data } : a
      )

      return { success: true, appointment: data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reschedule'
      return { success: false, error: error.value }
    }
  }

  /**
   * Subscribe to appointment updates (realtime)
   */
  function subscribeToAppointment(appointmentId: string) {
    const channel = supabase
      .channel(`appointment:${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `id=eq.${appointmentId}`
        },
        (payload) => {
          const updated = payload.new as Appointment
          if (currentAppointment.value?.id === appointmentId) {
            currentAppointment.value = {
              ...currentAppointment.value,
              ...updated
            }
          }
          appointments.value = appointments.value.map(a =>
            a.id === appointmentId ? { ...a, ...updated } : a
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    appointments,
    currentAppointment,
    upcomingAppointments,
    pastAppointments,
    loading,
    error,
    fetchAppointments,
    fetchAppointment,
    createAppointment,
    cancelAppointment,
    rescheduleAppointment,
    subscribeToAppointment
  }
}
