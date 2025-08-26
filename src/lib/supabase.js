import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase URL and Anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Work Permit API functions
export const workPermitApi = {
  // Create new work permit
  async createWorkPermit(data) {
    const { data: result, error } = await supabase
      .from('work_permits')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  // Get all work permits
  async getAllWorkPermits() {
    const { data, error } = await supabase
      .from('work_permits')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get work permit by ID
  async getWorkPermit(id) {
    const { data, error } = await supabase
      .from('work_permits')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Update work permit
  async updateWorkPermit(id, updates) {
    const { data, error } = await supabase
      .from('work_permits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update approval status
  async updateApprovalStatus(id, status, reason = null, signature = null) {
    const updates = {
      approval_status: status,
      approval_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (reason) updates.approval_incomplete_reason = reason
    if (signature) updates.approver_signature = signature

    const { data, error } = await supabase
      .from('work_permits')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Upload file
  async uploadFile(file, permitId) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${permitId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('work-permit-files')
      .upload(fileName, file)
    
    if (error) throw error
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('work-permit-files')
      .getPublicUrl(fileName)
    
    // Save file record to database
    const { data: fileRecord, error: dbError } = await supabase
      .from('permit_files')
      .insert({
        permit_id: permitId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size
      })
      .select()
      .single()
    
    if (dbError) throw dbError
    return fileRecord
  },

  // Get files for permit
  async getPermitFiles(permitId) {
    const { data, error } = await supabase
      .from('permit_files')
      .select('*')
      .eq('permit_id', permitId)
    
    if (error) throw error
    return data
  }
}