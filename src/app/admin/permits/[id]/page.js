'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { workPermitApi } from '@/lib/supabase'
import { ArrowLeft, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AdminPermitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [permit, setPermit] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadPermitDetail()
    }
  }, [params.id])

  const loadPermitDetail = async () => {
    try {
      const [permitData, filesData] = await Promise.all([
        workPermitApi.getWorkPermit(params.id),
        workPermitApi.getPermitFiles(params.id)
      ])
      
      setPermit(permitData)
      setFiles(filesData)
    } catch (error) {
      console.error('Error loading permit:', error)
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (status) => {
    const action = status === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'
    if (!confirm(`คุณต้องการ${action}ใบขอนี้ใช่หรือไม่?`)) return

    const signature = prompt('กรุณาใส่ชื่อผู้อนุมัติ:')
    if (!signature) return

    let reason = null
    if (status === 'rejected') {
      reason = prompt('กรุณาระบุเหตุผลที่ไม่อนุมัติ:')
      if (!reason) return
    }

    setActionLoading(true)
    try {
      await workPermitApi.updateApprovalStatus(params.id, status, reason, signature)
      alert(`${action}ใบขอสำเร็จ`)
      router.push('/admin')
    } catch (error) {
      console.error('Error updating approval:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดต')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-pending">รอดำเนินการ</span>
      case 'approved':
        return <span className="status-approved">อนุมัติ</span>
      case 'rejected':
        return <span className="status-rejected">ไม่อนุมัติ</span>
      default:
        return <span className="status-pending">รอดำเนินการ</span>
    }
  }

  const parseJSONField = (field) => {
    try {
      return typeof field === 'string' ? JSON.parse(field) : field || {}
    } catch {
      return {}
    }
  }

  const renderCheckboxSection = (title, items, labels, isRequired = false) => {
    const checkedItems = Object.keys(items).filter(key => items[key])
    const hasIssues = isRequired && checkedItems.length === 0

    return (
      <div className={`border rounded-lg p-4 ${hasIssues ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        <h4 className={`text-md font-medium mb-3 ${hasIssues ? 'text-red-900' : 'text-gray-900'}`}>
          {title}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {hasIssues && <AlertTriangle className="inline h-4 w-4 ml-1 text-red-500" />}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.keys(labels).map(key => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={items[key] || false}
                disabled
                className="form-checkbox mr-2"
              />
              <span className={`text-sm ${items[key] ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {labels[key]}
              </span>
            </div>
          ))}
        </div>
        {hasIssues && (
          <p className="text-sm text-red-600 mt-2">⚠️ จำเป็นต้องเลือกอย่างน้อย 1 รายการ</p>
        )}
      </div>
    )
  }

  const validatePermit = () => {
    const issues = []
    
    // Check basic required fields
    if (!permit.work_type) issues.push('ไม่ได้ระบุประเภทงาน')
    if (!permit.start_date) issues.push('ไม่ได้ระบุวันที่เริ่มงาน')
    if (!permit.applicant_name) issues.push('ไม่ได้ระบุชื่อผู้ขอ')
    
    // Check work details
    const workDetails = parseJSONField(permit.work_details)
    const hasWorkDetails = Object.values(workDetails).some(v => v === true)
    if (!hasWorkDetails) issues.push('ไม่ได้เลือกรายละเอียดของงาน')
    
    // Check safety compliance
    const safetyCompliance = parseJSONField(permit.safety_compliance)
    const hasSafetyCompliance = Object.values(safetyCompliance).some(v => v === true)
    if (!hasSafetyCompliance) issues.push('ไม่ได้เลือกข้อพึงปฏิบัติด้านความปลอดภัย')
    
    // Check PPE requirements
    const ppeRequirements = parseJSONField(permit.ppe_requirements)
    const hasPPE = Object.values(ppeRequirements).some(v => v === true)
    if (!hasPPE) issues.push('ไม่ได้เลือกอุปกรณ์ป้องกันส่วนบุคคล')
    
    return issues
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!permit) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900">ไม่พบใบขออนุญาต</h2>
        <Link href="/admin" className="btn-primary mt-4">
          กลับไปหน้า Admin
        </Link>
      </div>
    )
  }

  const workDetails = parseJSONField(permit.work_details)
  const specialWorkType = parseJSONField(permit.special_work_type)
  const relatedDocuments = parseJSONField(permit.related_documents)
  const safetyCompliance = parseJSONField(permit.safety_compliance)
  const ppeRequirements = parseJSONField(permit.ppe_requirements)
  const fireExtinguisherTypes = parseJSONField(permit.fire_extinguisher_types)
  const atmosphereMonitoring = parseJSONField(permit.atmosphere_monitoring)
  
  const validationIssues = validatePermit()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin" className="btn-secondary mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ Admin
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">พิจารณาใบขออนุญาต</h1>
            <p className="text-gray-600">{permit.permit_number}</p>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(permit.approval_status)}
        </div>
      </div>

      {/* Validation Issues Alert */}
      {validationIssues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">ข้อมูลที่ควรตรวจสอบ</h3>
              <ul className="mt-2 text-sm text-yellow-700">
                {validationIssues.map((issue, index) => (
                  <li key={index} className="mt-1">• {issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Summary Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">สรุปข้อมูลสำคัญ</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ประเภทงาน</label>
              <p className="text-sm text-gray-900 font-medium">{permit.work_type}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ผู้ขอ</label>
              <p className="text-sm text-gray-900 font-medium">{permit.applicant_name}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">บริษัท</label>
              <p className="text-sm text-gray-900 font-medium">{permit.contractor_company || '-'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">วันที่เริ่มงาน</label>
              <p className="text-sm text-gray-900 font-medium">
                {permit.start_date ? new Date(permit.start_date).toLocaleDateString('th-TH') : '-'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">จำนวนคนงาน</label>
              <p className="text-sm text-gray-900 font-medium">{permit.worker_count} คน</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">สถานที่</label>
              <p className="text-sm text-gray-900 font-medium truncate">{permit.work_location || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Work Details Review */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">รายละเอียดของงาน</h2>
          </div>
          <div className="card-body">
            {renderCheckboxSection(
              'ประเภทงานที่จะดำเนินการ',
              workDetails,
              {
                grinding: 'เจียร/ตัด',
                electric_welding: 'เชื่อม/ตัดด้วยไฟฟ้า',
                gas_welding: 'เชื่อม/ตัดด้วยก๊าซ',
                drilling: 'เจาะ/ขุด',
                other: 'อื่นๆ'
              },
              true
            )}
            
            {permit.tools_equipment && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-1">เครื่องมืออุปกรณ์</label>
                <p className="text-sm text-gray-900">{permit.tools_equipment}</p>
              </div>
            )}
          </div>
        </div>

        {/* Safety Compliance Review */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">การปฏิบัติตามมาตรการความปลอดภัย</h2>
          </div>
          <div className="card-body">
            {renderCheckboxSection(
              'ข้อพึงปฏิบัติในการปฏิบัติงาน',
              safetyCompliance,
              {
                system_isolation: '1. ตัดแยกระบบ',
                lockout_tagout: '2. ตัด/ล็อคอุปกรณ์และแขวนป้ายห้าม (LOTO)',
                warning_signs: '3. ติดตั้งป้ายเตือนอันตราย',
                tool_inspection: '4. ตรวจสอบสภาพเครื่องมือ/อุปกรณ์ไฟฟ้า',
                gas_tank_inspection: '5. ตรวจสอบสภาพถังแก๊ส',
                fire_equipment: '6. เตรียมอุปกรณ์ดับเพลิง/ตอบโต้ฉุกเฉิน',
                proper_clothing: '7. แต่งกายเหมาะสม/สวมใส่ PPE',
                area_barriers: '8. กั้นบริเวณพื้นที่ปฏิบัติงาน',
                atmosphere_monitoring: '9. ตรวจวัดบรรยากาศ',
                ventilation_system: '10. ติดตั้งระบบระบายอากาศ'
              },
              true
            )}
          </div>
        </div>

        {/* PPE Review */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">อุปกรณ์ป้องกันส่วนบุคคล (PPE)</h2>
          </div>
          <div className="card-body">
            {renderCheckboxSection(
              'อุปกรณ์ที่จำเป็นต้องใช้',
              ppeRequirements,
              {
                basic_ppe: '1. PPE พื้นฐาน (หมวก/รองเท้านิรภัย)',
                dust_mask: '2. หน้ากากกันฝุ่น/ฟูม/ก๊าซพิษ',
                welding_mask: '3. หน้ากากเชื่อม/กระบังหน้า',
                safety_glasses: '4. แว่นตานิรภัย',
                ear_protection: '5. ครอบตานิรภัย',
                welding_gloves: '6. ถุงมือสำหรับงานเชื่อม',
                hearing_protection: '7. ปลั๊กอุดหู/ที่ครอบหู',
                safety_harness: '8. เข็มขัดนิรภัยพร้อมสายช่วยชีวิต',
                fire_resistant_clothing: '9. ชุด/เอี๊ยมกันสะเก็ดไฟ',
                canvas_sling: '10. Sling ผ้าใบ'
              },
              true
            )}
          </div>
        </div>

        {/* Atmosphere Monitoring */}
        {atmosphereMonitoring && (Object.values(atmosphereMonitoring).some(v => v)) && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">การตรวจวัดบรรยากาศ</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ก๊าซออกซิเจน (%)</label>
                  <p className="text-sm text-gray-900">{atmosphereMonitoring.oxygen_level || 'ไม่ได้ระบุ'}</p>
                  <p className="text-xs text-gray-500">(มาตรฐาน: ไม่ต่ำกว่า 19.5%)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ก๊าซไวไฟ (%)</label>
                  <p className="text-sm text-gray-900">{atmosphereMonitoring.flammable_gas || 'ไม่ได้ระบุ'}</p>
                  <p className="text-xs text-gray-500">(มาตรฐาน: ต่ำกว่า 100% OEL)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Files Review */}
        {files.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">เอกสารแนบ ({files.length})</h2>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{file.file_name}</span>
                    </div>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900 text-sm"
                    >
                      ดูไฟล์
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {permit.approval_status === 'pending' && (
          <div className="card bg-gray-50">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 mb-4">การพิจารณาอนุมัติ</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleApproval('approved')}
                  disabled={actionLoading}
                  className="btn-success flex-1 flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      อนุมัติใบขอนี้
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleApproval('rejected')}
                  disabled={actionLoading}
                  className="btn-danger flex-1 flex items-center justify-center"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  ไม่อนุมัติใบขอนี้
                </button>
              </div>
              
              {validationIssues.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-100 rounded">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>คำแนะนำ:</strong> พบประเด็นที่ควรตรวจสอบ {validationIssues.length} รายการ 
                    หากข้อมูลไม่ครบถ้วน ควรพิจารณาไม่อนุมัติและให้ผู้ขอแก้ไข
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {permit.approval_status !== 'pending' && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">ผลการพิจารณา</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">สถานะ</label>
                  {getStatusBadge(permit.approval_status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">วันที่พิจารณา</label>
                  <p className="text-sm text-gray-900">
                    {permit.approval_date ? new Date(permit.approval_date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ผู้อนุมัติ</label>
                  <p className="text-sm text-gray-900">{permit.approver_signature || '-'}</p>
                </div>
                {permit.approval_status === 'rejected' && permit.approval_incomplete_reason && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">เหตุผลที่ไม่อนุมัติ</label>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{permit.approval_incomplete_reason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}