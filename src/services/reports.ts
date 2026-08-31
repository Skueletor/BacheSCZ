import { seedReports } from '../mocks/reports'
import { DraftReport, Report, ReportFilter, ReportStats, ReportStatus } from '../types/domain'
import { appStorage } from './storage'
import { supabase } from './supabase'
import { sessionService } from './session'

const STORAGE_KEY = '@bache_scz_reports_v2'

const isSupabaseConfigured = (): boolean => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url && 
    key && 
    !url.includes('tu-proyecto') && 
    !key.includes('tu-clave')
  )
}

/**
 * Reports Repository (Relational database model)
 * Automatically integrates with Supabase if configured,
 * falling back gracefully to AsyncStorage local persistence otherwise.
 */
class ReportRepository {
  // === LOCAL FALLBACK METHODS ===
  private async loadAllLocal(): Promise<Report[]> {
    try {
      const raw = await appStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
      await appStorage.setItem(STORAGE_KEY, JSON.stringify(seedReports))
      return seedReports
    } catch (error) {
      console.warn('[ReportRepository] Error reading local storage:', error)
      return seedReports
    }
  }

  private async saveAllLocal(reports: Report[]): Promise<void> {
    try {
      await appStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
    } catch (error) {
      console.error('[ReportRepository] Failed to save local reports:', error)
      throw new Error('No se pudo guardar el reporte localmente.')
    }
  }

  // === GENERAL SERVICE METHODS ===
  async getReports(filter?: ReportFilter): Promise<Report[]> {
    let all: Report[] = []

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*, images:report_images(*), history:report_history(*)')
          .order('createdAt', { ascending: false })

        if (error) throw error

        all = (data || []).map((row: any) => ({
          id: row.id,
          userId: row.userId,
          title: row.title,
          description: row.description,
          location: {
            latitude: row.latitude,
            longitude: row.longitude,
            address: row.address,
            accuracy: row.accuracy
          },
          severity: row.severity,
          category: row.category,
          status: row.status,
          images: row.images || [],
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          history: row.history ? [...row.history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [],
          suggestedRepair: row.suggestedRepair || undefined
        }))
      } catch (err) {
        console.error('[ReportRepository] Error fetching from relational Supabase, using local fallback:', err)
        all = await this.loadAllLocal()
      }
    } else {
      all = await this.loadAllLocal()
    }

    if (!filter) {
      return all
    }

    return all.filter((report) => {
      if (filter.status && filter.status !== 'ALL' && report.status !== filter.status) {
        return false
      }
      if (filter.severity && filter.severity !== 'ALL' && report.severity !== filter.severity) {
        return false
      }
      if (filter.search && filter.search.trim() !== '') {
        const query = filter.search.toLowerCase().trim()
        const inTitle = report.title.toLowerCase().includes(query)
        const inAddress = report.location.address.toLowerCase().includes(query)
        const inDesc = report.description.toLowerCase().includes(query)
        if (!inTitle && !inAddress && !inDesc) {
          return false
        }
      }
      return true
    })
  }

  async getReportById(id: string): Promise<Report | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*, images:report_images(*), history:report_history(*)')
          .eq('id', id)
          .single()

        if (error) throw error
        if (!data) return null

        return {
          id: data.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          location: {
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address,
            accuracy: data.accuracy
          },
          severity: data.severity,
          category: data.category,
          status: data.status,
          images: data.images || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          history: data.history ? [...data.history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [],
          suggestedRepair: data.suggestedRepair || undefined
        }
      } catch (err) {
        console.error('[ReportRepository] Error fetching report by ID from relational Supabase:', err)
        const allLocal = await this.loadAllLocal()
        return allLocal.find((r) => r.id === id) || null
      }
    }

    const allLocal = await this.loadAllLocal()
    return allLocal.find((r) => r.id === id) || null
  }

  async createReport(draft: DraftReport): Promise<Report> {
    const activeUser = await sessionService.getActiveUser()
    const now = new Date().toISOString()
    const id = `rep-scz-${Date.now()}`

    const newReport: Report = {
      id,
      userId: activeUser.id,
      title: draft.title || (draft.category === 'POTHOLE' ? 'Bache en calzada' : 'Pozo o daño en la vía'),
      description: draft.description.trim() || 'Reporte registrado por un vecino de Santa Cruz.',
      location: draft.location,
      severity: draft.severity,
      category: draft.category,
      status: 'RECEIVED',
      images: draft.imageUri ? [{ id: `img-${Date.now()}`, uri: draft.imageUri, createdAt: now }] : [],
      createdAt: now,
      updatedAt: now,
      history: [
        {
          status: 'RECEIVED',
          note: 'Reporte registrado. En espera de evaluación por la cuadrilla.',
          createdAt: now,
        },
      ],
    }

    if (isSupabaseConfigured()) {
      try {
        // 1. Ensure active user profile exists in public.profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', activeUser.id)

        if (!profile || profile.length === 0) {
          await supabase.from('profiles').insert([{
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            neighborhood: activeUser.neighborhood,
            role: activeUser.role,
            "avatarUri": activeUser.avatarUri || null
          }])
        }

        // 2. Insert main report
        const { error: reportError } = await supabase
          .from('reports')
          .insert([{
            id: newReport.id,
            userId: newReport.userId,
            title: newReport.title,
            description: newReport.description,
            latitude: newReport.location.latitude,
            longitude: newReport.location.longitude,
            address: newReport.location.address,
            accuracy: newReport.location.accuracy || null,
            severity: newReport.severity,
            category: newReport.category,
            status: newReport.status,
            suggestedRepair: newReport.suggestedRepair || null,
            createdAt: newReport.createdAt,
            updatedAt: newReport.updatedAt
          }])

        if (reportError) throw reportError

        // 3. Insert initial history item
        const { error: historyError } = await supabase
          .from('report_history')
          .insert([{
            reportId: newReport.id,
            status: 'RECEIVED',
            note: 'Reporte registrado. En espera de evaluación por la cuadrilla.',
            createdAt: now
          }])

        if (historyError) throw historyError

        // 4. Insert image if exists
        if (draft.imageUri) {
          const imgId = `img-${Date.now()}`
          const { error: imageError } = await supabase
            .from('report_images')
            .insert([{
              id: imgId,
              reportId: newReport.id,
              uri: draft.imageUri,
              createdAt: now
            }])
          if (imageError) throw imageError
        }

        return newReport
      } catch (err) {
        console.error('[ReportRepository] Error saving report to relational Supabase, saving locally:', err)
        const allLocal = await this.loadAllLocal()
        const updated = [newReport, ...allLocal]
        await this.saveAllLocal(updated)
        return newReport
      }
    }

    const allLocal = await this.loadAllLocal()
    const updated = [newReport, ...allLocal]
    await this.saveAllLocal(updated)
    return newReport
  }

  async updateReportStatus(reportId: string, status: ReportStatus, note: string): Promise<Report | null> {
    const now = new Date().toISOString()
    const activeUser = await sessionService.getActiveUser()

    // 0. Ensure admin profile exists in profiles table
    if (isSupabaseConfigured()) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', activeUser.id)

        if (!profile || profile.length === 0) {
          await supabase.from('profiles').insert([{
            id: activeUser.id,
            name: activeUser.name,
            email: activeUser.email,
            neighborhood: activeUser.neighborhood,
            role: activeUser.role,
            "avatarUri": activeUser.avatarUri || null
          }])
        }

        // 1. Update report status in reports table
        const { error: reportError } = await supabase
          .from('reports')
          .update({ status, "updatedAt": now })
          .eq('id', reportId)

        if (reportError) throw reportError

        // 2. Insert new history item in report_history table
        const { error: historyError } = await supabase
          .from('report_history')
          .insert([{
            "reportId": reportId,
            status,
            note: note.trim() || `Estado actualizado a: ${status}`,
            "createdAt": now
          }])

        if (historyError) throw historyError

        // 3. Fetch and return the updated report
        return await this.getReportById(reportId)
      } catch (err) {
        console.error('[ReportRepository] Error updating status in relational Supabase:', err)
      }
    }

    // Local fallback
    const allLocal = await this.loadAllLocal()
    const index = allLocal.findIndex((r) => r.id === reportId)
    if (index !== -1) {
      const updatedReport = {
        ...allLocal[index],
        status,
        updatedAt: now,
        history: [
          ...allLocal[index].history,
          {
            status,
            note: note.trim() || `Estado actualizado a: ${status}`,
            createdAt: now
          }
        ]
      }
      allLocal[index] = updatedReport
      await this.saveAllLocal(allLocal)
      return updatedReport
    }
    return null
  }

  async getStats(): Promise<ReportStats> {
    let all: any[] = []

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('id, status, severity')

        if (error) throw error
        all = data || []
      } catch (err) {
        console.error('[ReportRepository] Error fetching relational stats from Supabase:', err)
        all = await this.loadAllLocal()
      }
    } else {
      all = await this.loadAllLocal()
    }

    return {
      total: all.length,
      received: all.filter((r) => r.status === 'RECEIVED').length,
      inProgress: all.filter((r) => ['UNDER_REVIEW', 'INSPECTION', 'SCHEDULED', 'IN_PROGRESS'].includes(r.status)).length,
      resolved: all.filter((r) => r.status === 'RESOLVED').length,
      critical: all.filter((r) => r.severity === 'CRITICAL' && r.status !== 'RESOLVED').length,
    }
  }

  async resetToDefaults(): Promise<Report[]> {
    if (isSupabaseConfigured()) {
      try {
        // Clear all dependency tables in relational order
        await supabase.from('report_images').delete().neq('id', 'placeholder')
        await supabase.from('report_history').delete().neq('status', 'placeholder')
        await supabase.from('reports').delete().neq('id', 'placeholder')
        
        // Insert mock profiles
        await supabase.from('profiles').upsert([
          {
            id: 'vecino-scz',
            name: 'Vecino Vigilante SCZ',
            email: 'vecino@santacruz.gob.bo',
            neighborhood: 'Casco Viejo',
            role: 'USER',
            avatarUri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120'
          },
          {
            id: 'admin-alcaldia',
            name: 'Administrador Alcaldía',
            email: 'admin@santacruz.gob.bo',
            neighborhood: 'Centro',
            role: 'ADMIN',
            avatarUri: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=120'
          }
        ])

        // Insert seed reports and relations
        for (const report of seedReports) {
          await supabase.from('reports').insert([{
            id: report.id,
            userId: report.userId,
            title: report.title,
            description: report.description,
            latitude: report.location.latitude,
            longitude: report.location.longitude,
            address: report.location.address,
            accuracy: report.location.accuracy || null,
            severity: report.severity,
            category: report.category,
            status: report.status,
            suggestedRepair: report.suggestedRepair || null,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
          }])

          // Insert images
          for (const img of report.images) {
            await supabase.from('report_images').insert([{
              id: img.id,
              reportId: report.id,
              uri: img.uri,
              createdAt: img.createdAt
            }])
          }

          // Insert history
          for (const item of report.history) {
            await supabase.from('report_history').insert([{
              reportId: report.id,
              status: item.status,
              note: item.note,
              createdAt: item.createdAt
            }])
          }
        }
        return seedReports
      } catch (err) {
        console.error('[ReportRepository] Error resetting relational Supabase database:', err)
      }
    }
    await appStorage.setItem(STORAGE_KEY, JSON.stringify(seedReports))
    return seedReports
  }
}

export const reportRepository = new ReportRepository()
