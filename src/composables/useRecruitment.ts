import { ref } from 'vue'
import { supabase } from '@/services/supabase'

// ============================================================================
// Types
// ============================================================================

export interface ApplicationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  experience: string
  city?: string
  zipCode?: string
  specialties?: string[]
  certifications?: string[]
  hasVehicle?: boolean
  hasTools?: boolean
  motivation?: string
  cvFile?: File
  jobId?: string
}

export interface ApplicationStatus {
  id: string
  status: string
  currentStatus?: string
  stageName?: string
  stageColor?: string
  submittedAt: string
  updatedAt?: string
}

export interface RecruitmentJob {
  id: string
  title: string
  slug: string
  description: string | null
  requirements: string[] | null
  responsibilities: string[] | null
  contractType: string
  location: string
  city: string | null
  zipCode: string | null
  isRemote: boolean
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string
  experienceRequired: number
  specialties: string[]
  benefits: string[]
  status: string
  applicationsCount: number
  publishedAt: string | null
  closesAt: string | null
}

export interface RecruitmentAdvantage {
  id: string
  title: string
  description: string | null
  icon: string | null
  category: string
  displayOrder: number
  isHighlighted: boolean
}

export interface IncomeSimulationParams {
  hoursPerWeek: number
  experienceYears?: number
  location?: string
  specialties?: string[]
}

export interface IncomeSimulationResult {
  monthlyGross: number
  commission: number
  socialCharges: number
  monthlyNet: number
  yearlyNet: number
  garageComparison: number
  gainVsGarage: number
  gainPercent: number
  hourlyRateUsed: number
  configUsed: {
    commissionRate: number
    socialChargesRate: number
    hourlyRateBase: number
    locationBonus: number
    specialtyBonus: number
  }
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Composable pour gérer le recrutement mécaniciens
 *
 * @returns Methods et state pour gestion candidatures, offres et simulateur
 */
export function useRecruitment() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const applicationStatus = ref<ApplicationStatus | null>(null)
  const jobs = ref<RecruitmentJob[]>([])
  const advantages = ref<RecruitmentAdvantage[]>([])

  // ==========================================================================
  // Jobs (Offres d'emploi)
  // ==========================================================================

  /**
   * Récupérer les offres d'emploi
   */
  async function fetchJobs(params?: {
    location?: string
    contractType?: string
    experienceMax?: number
  }): Promise<RecruitmentJob[]> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase.rpc('recruit_get_jobs', {
        p_location: params?.location || null,
        p_contract_type: params?.contractType || null,
        p_experience_max: params?.experienceMax || null
      })

      if (fetchError) throw new Error(fetchError.message)

      jobs.value = (data || []).map(mapJobFromDb)
      return jobs.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer une offre par ID ou slug
   */
  async function fetchJob(params: { id?: string; slug?: string }): Promise<RecruitmentJob | null> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase.rpc('recruit_get_job', {
        p_job_id: params.id || null,
        p_slug: params.slug || null
      })

      if (fetchError) throw new Error(fetchError.message)
      if (!data || data.length === 0) return null

      return mapJobFromDb(data[0])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================================================
  // Advantages (Avantages)
  // ==========================================================================

  /**
   * Récupérer les avantages mécaniciens
   */
  async function fetchAdvantages(params?: {
    category?: string
    highlightedOnly?: boolean
  }): Promise<RecruitmentAdvantage[]> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase.rpc('recruit_get_advantages', {
        p_category: params?.category || null,
        p_highlighted_only: params?.highlightedOnly || false
      })

      if (fetchError) throw new Error(fetchError.message)

      advantages.value = (data || []).map(mapAdvantageFromDb)
      return advantages.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================================================
  // Income Simulator (Simulateur de revenus)
  // ==========================================================================

  /**
   * Simuler les revenus d'un mécanicien
   */
  async function simulateIncome(params: IncomeSimulationParams): Promise<IncomeSimulationResult | null> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase.rpc('recruit_simulate_income', {
        p_hours_per_week: params.hoursPerWeek,
        p_experience_years: params.experienceYears || 0,
        p_location: params.location || null,
        p_specialties: params.specialties || []
      })

      if (fetchError) throw new Error(fetchError.message)
      if (!data || data.length === 0) return null

      const result = data[0]
      return {
        monthlyGross: parseFloat(result.monthly_gross),
        commission: parseFloat(result.commission),
        socialCharges: parseFloat(result.social_charges),
        monthlyNet: parseFloat(result.monthly_net),
        yearlyNet: parseFloat(result.yearly_net),
        garageComparison: parseFloat(result.garage_comparison),
        gainVsGarage: parseFloat(result.gain_vs_garage),
        gainPercent: parseFloat(result.gain_percent),
        hourlyRateUsed: parseFloat(result.hourly_rate_used),
        configUsed: {
          commissionRate: result.config_used.commission_rate,
          socialChargesRate: result.config_used.social_charges_rate,
          hourlyRateBase: result.config_used.hourly_rate_base,
          locationBonus: result.config_used.location_bonus,
          specialtyBonus: result.config_used.specialty_bonus
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================================================
  // Applications (Candidatures)
  // ==========================================================================

  /**
   * Soumettre une candidature
   */
  async function submitApplication(data: ApplicationData): Promise<{ success: boolean; applicationId?: string; message?: string }> {
    isLoading.value = true
    error.value = null

    try {
      let cvUrl: string | undefined

      // Upload CV si fourni
      if (data.cvFile) {
        const fileExt = data.cvFile.name.split('.').pop()
        const fileName = `${Date.now()}_${data.firstName}_${data.lastName}.${fileExt}`
        const filePath = `recruitment/cvs/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('recruitment')
          .upload(filePath, data.cvFile)

        if (uploadError) {
          throw new Error(`Erreur upload CV: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('recruitment')
          .getPublicUrl(filePath)

        cvUrl = urlData.publicUrl
      }

      // Appeler la fonction DB
      const { data: result, error: submitError } = await supabase.rpc('recruit_submit_application', {
        p_first_name: data.firstName,
        p_last_name: data.lastName,
        p_email: data.email,
        p_phone: data.phone,
        p_experience_years: parseInt(data.experience),
        p_city: data.city || null,
        p_zip_code: data.zipCode || null,
        p_specialties: data.specialties || [],
        p_has_vehicle: data.hasVehicle ?? null,
        p_has_tools: data.hasTools ?? null,
        p_motivation: data.motivation || null,
        p_cv_url: cvUrl || null,
        p_job_id: data.jobId || null
      })

      if (submitError) throw new Error(submitError.message)

      const response = result[0]
      if (!response.success) {
        error.value = response.message
        return { success: false, message: response.message }
      }

      return { success: true, applicationId: response.application_id, message: response.message }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer le statut d'une candidature par email
   */
  async function fetchApplicationStatus(email: string): Promise<ApplicationStatus | null> {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase.rpc('recruit_get_application_status', {
        p_email: email
      })

      if (fetchError) throw new Error(fetchError.message)
      if (!data || data.length === 0) return null

      const result = data[0]
      applicationStatus.value = {
        id: result.application_id,
        status: result.status,
        currentStatus: result.current_status,
        stageName: result.stage_name,
        stageColor: result.stage_color,
        submittedAt: result.submitted_at,
        updatedAt: result.updated_at
      }

      return applicationStatus.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Upload un document de candidature
   */
  async function uploadDocument(
    applicationId: string,
    file: File,
    documentType: string
  ): Promise<{ success: boolean; url?: string }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${applicationId}/${documentType}_${Date.now()}.${fileExt}`
      const filePath = `recruitment/documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('recruitment')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Erreur upload: ${uploadError.message}`)
      }

      const { data: urlData } = supabase.storage
        .from('recruitment')
        .getPublicUrl(filePath)

      return { success: true, url: urlData.publicUrl }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur upload'
      return { success: false }
    }
  }

  // ==========================================================================
  // Mappers
  // ==========================================================================

  function mapJobFromDb(row: Record<string, unknown>): RecruitmentJob {
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      description: row.description as string | null,
      requirements: row.requirements as string[] | null,
      responsibilities: row.responsibilities as string[] | null,
      contractType: row.contract_type as string,
      location: row.location as string,
      city: row.city as string | null,
      zipCode: row.zip_code as string | null,
      isRemote: row.is_remote as boolean,
      salaryMin: row.salary_min as number | null,
      salaryMax: row.salary_max as number | null,
      salaryType: row.salary_type as string,
      experienceRequired: row.experience_required as number,
      specialties: (row.specialties as string[]) || [],
      benefits: (row.benefits as string[]) || [],
      status: row.status as string,
      applicationsCount: row.applications_count as number,
      publishedAt: row.published_at as string | null,
      closesAt: row.closes_at as string | null
    }
  }

  function mapAdvantageFromDb(row: Record<string, unknown>): RecruitmentAdvantage {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string | null,
      icon: row.icon as string | null,
      category: row.category as string,
      displayOrder: row.display_order as number,
      isHighlighted: row.is_highlighted as boolean
    }
  }

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // State
    isLoading,
    error,
    applicationStatus,
    jobs,
    advantages,

    // Jobs
    fetchJobs,
    fetchJob,

    // Advantages
    fetchAdvantages,

    // Simulator
    simulateIncome,

    // Applications
    submitApplication,
    fetchApplicationStatus,
    uploadDocument
  }
}
