'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { workPermitApi } from '@/lib/supabase'
import { ArrowLeft, FileText, Download, Calendar, User, Building, MapPin, Users, Wrench } from 'lucide-react'
import Link from 'next/link'

export default function PermitDetailPage() {
  const params = useParams()
  const [permit, setPermit] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

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

  const renderCheckboxList = (items, labels) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.keys(labels).map(key => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              checked={items[key] || false}
              disabled
              className="form-checkbox mr-2"
            />
            <span className={`text-sm ${items[key] ? 'text-gray-900' : 'text-gray-500'}`}>
              {labels[key]}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

//   if (!permit) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-xl font-medium text-gray-900">ไม่พบใบขออนุญาต</h2>
//         <Link href="/permits" className="btn-primary mt-4">
//           กลับไปหน้ารายการ
//         </Link>
//       </div>
//     )
//   }

  const workDetails = parseJSONField(permit.work_details)
  const specialWorkType = parseJSONField(permit.special_work_type)
  const relatedDocuments = parseJSONField(permit.related_documents)
  const safetyCompliance = parseJSONField(permit.safety_compliance)
  const ppeRequirements = parseJSONField(permit.ppe_requirements)
  const fireExtinguisherTypes = parseJSONField(permit.fire_extinguisher_types)
  const atmosphereMonitoring = parseJSONField(permit.atmosphere_monitoring)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/" className="btn-secondary mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายละเอียดใบขออนุญาต</h1>
            <p className="text-gray-600">{permit.permit_number}</p>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(permit.approval_status)}
          {/* {permit.approval_status === 'pending' && (
            <div className="mt-2">
              <Link href={`/admin/permits/${permit.id}`} className="btn-primary text-sm">
                จัดการใบขอนี้
              </Link>
            </div>
          )} */}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              ข้อมูลพื้นฐาน
            </h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ประเภทงาน</label>
                <p className="text-sm text-gray-900">{permit.work_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">วันที่เริ่มปฏิบัติงาน</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {permit.start_date ? new Date(permit.start_date).toLocaleDateString('th-TH') : '-'} 
                  {permit.start_time && ` เวลา ${permit.start_time}`}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ผู้ขอใบอนุญาต</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {permit.applicant_name}
                </p>
                {permit.phone_number && (
                  <p className="text-sm text-gray-500">{permit.phone_number}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">บริษัทผู้รับเหมา</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {permit.contractor_company || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">หัวหน้างาน</label>
                <p className="text-sm text-gray-900">{permit.supervisor_name || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ผู้จัดการโครงการ</label>
                <p className="text-sm text-gray-900">{permit.project_manager || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">สถานที่และพื้นที่ปฏิบัติงาน</label>
                <p className="text-sm text-gray-900 flex items-start">
                  <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                  {permit.work_location || '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">จำนวนผู้ปฏิบัติงาน</label>
                <p className="text-sm text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {permit.worker_count} คน
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">รายชื่อผู้ปฏิบัติงาน</label>
                <p className="text-sm text-gray-900 whitespace-pre-line">{permit.worker_names || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">เครื่องมืออุปกรณ์ที่ใช้ทำงาน</label>
                <p className="text-sm text-gray-900 flex items-start">
                  <Wrench className="h-4 w-4 mr-1 mt-0.5" />
                  {permit.tools_equipment || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">รายละเอียดของงาน</h2>
          </div>
          <div className="card-body">
            {renderCheckboxList(workDetails, {
              grinding: 'เจียร/ตัด',
              electric_welding: 'เชื่อม/ตัดด้วยไฟฟ้า',
              gas_welding: 'เชื่อม/ตัดด้วยก๊าซ',
              drilling: 'เจาะ/ขุด',
              other: 'อื่นๆ'
            })}
            
            {workDetails.gas_type && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">ชนิดก๊าซ</label>
                <p className="text-sm text-gray-900">{workDetails.gas_type}</p>
              </div>
            )}
            
            {workDetails.other_detail && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">รายละเอียดอื่นๆ</label>
                <p className="text-sm text-gray-900">{workDetails.other_detail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Special Work Types */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">ใบอนุญาตทำงานเฉพาะ</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">ลักษณะงาน</h3>
              {renderCheckboxList(specialWorkType, {
                confined_space: 'ทำงานในที่อับอากาศ',
                height_work: 'ทำงานบนที่สูง',
                other: 'อื่นๆ'
              })}
              {specialWorkType.other_detail && (
                <div className="mt-2">
                  <p className="text-sm text-gray-900">รายละเอียด: {specialWorkType.other_detail}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">เอกสารที่เกี่ยวข้อง</h3>
              {renderCheckboxList(relatedDocuments, {
                jsa: 'การวิเคราะห์งานเพื่อความปลอดภัย (JSA)',
                safety_measures: 'มาตรการความปลอดภัย',
                sds: 'ข้อมูลความปลอดภัยสารเคมี (SDS)',
                other_docs: 'เอกสารอื่นๆ'
              })}
              {relatedDocuments.sds_chemicals && (
                <div className="mt-2">
                  <p className="text-sm text-gray-900">สารเคมี: {relatedDocuments.sds_chemicals}</p>
                </div>
              )}
              {relatedDocuments.other_docs_detail && (
                <div className="mt-2">
                  <p className="text-sm text-gray-900">เอกสารอื่นๆ: {relatedDocuments.other_docs_detail}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Safety Compliance */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">ข้อพึงปฏิบัติในการปฏิบัติงาน</h2>
          </div>
          <div className="card-body">
            {renderCheckboxList(safetyCompliance, {
              system_isolation: '1. ตัดแยกระบบ',
              lockout_tagout: '2. ตัด/ล็อคอุปกรณ์และแขวนป้ายห้ามที่อุปกรณ์ (Lock out Tag out)',
              warning_signs: '3. ติดตั้งป้ายเตือนอันตราย',
              tool_inspection: '4. ตรวจสอบสภาพเครื่องมือ/เครื่องจักร/อุปกรณ์ไฟฟ้า',
              gas_tank_inspection: '5. ตรวจสอบสภาพถังแก๊ส',
              fire_equipment: '6. เตรียมพร้อมอุปกรณ์ดับเพลิง/อุปกรณ์ตอบโต้เหตุฉุกเฉิน',
              proper_clothing: '7. แต่งกายเหมาะสม,สวมใส่อุปกรณ์ป้องกันตลอดเวลาปฏิบัติงาน',
              area_barriers: '8. กั้นบริเวณพื้นที่ปฏิบัติงาน',
              atmosphere_monitoring: '9. ตรวจวัดบรรยากาศ',
              ventilation_system: '10. ติดตั้งระบบระบายอากาศ'
            })}
            {safetyCompliance.additional_requirements && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">ข้อกำหนดเพิ่มเติม</label>
                <p className="text-sm text-gray-900">{safetyCompliance.additional_requirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* PPE Requirements */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">อุปกรณ์คุ้มครองความปลอดภัยส่วนบุคคล</h2>
          </div>
          <div className="card-body">
            {renderCheckboxList(ppeRequirements, {
              basic_ppe: '1. PPE พื้นฐาน (หมวกนิรภัย,รองเท้านิรภัย)',
              dust_mask: '2. หน้ากากกันฝุ่น/ฟูม/ก๊าซพิษ',
              welding_mask: '3. หน้ากากเชื่อม/กระบังหน้า',
              safety_glasses: '4. แว่นตานิรภัย',
              ear_protection: '5. ครอบตานิรภัย',
              welding_gloves: '6. ถุงมือสำหรับงานเชื่อม',
              hearing_protection: '7. ปลั๊กอุดหู/ที่ครอบหู',
              safety_harness: '8. เข็มขัดนิรภัยชนิดเต็มตัว พร้อมสายช่วยชีวิต',
              fire_resistant_clothing: '9. ชุด/เอี๊ยมกันสะเก็ดไฟ',
              canvas_sling: '10. Sling ผ้าใบ'
            })}
            {ppeRequirements.other_ppe && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">อื่นๆ เพิ่มเติม</label>
                <p className="text-sm text-gray-900">{ppeRequirements.other_ppe}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fire Extinguisher */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">อุปกรณ์ดับเพลิง</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!permit.fire_extinguisher_needed}
                    disabled
                    className="form-checkbox mr-2"
                  />
                  ไม่จำเป็น
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={permit.fire_extinguisher_needed}
                    disabled
                    className="form-checkbox mr-2"
                  />
                  จำเป็น
                </label>
              </div>

              {permit.fire_extinguisher_needed && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">จำนวนถัง</label>
                    <p className="text-sm text-gray-900">{permit.fire_extinguisher_count} ถัง</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">ชนิดถังดับเพลิง</label>
                    {renderCheckboxList(fireExtinguisherTypes, {
                      water: 'ถังน้ำ (Water)',
                      foam: 'ถังโฟม (Foam)',
                      dry_chemical: 'ถังผงเคมีแห้ง (DCP)',
                      co2: 'ถังคาร์บอนไดออกไซด์ (CO₂)'
                    })}
                  </div>
                </div>
              )}

              {permit.fire_extinguisher_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">เหตุผล</label>
                  <p className="text-sm text-gray-900">{permit.fire_extinguisher_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Atmosphere Monitoring */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">การตรวจวัดบรรยากาศ</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ก๊าซออกซิเจน (%)</label>
                <p className="text-sm text-gray-900">{atmosphereMonitoring.oxygen_level || '-'}</p>
                <p className="text-xs text-gray-500">(ต้องไม่ต่ำกว่า 19.5%)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ก๊าซไวไฟ (%)</label>
                <p className="text-sm text-gray-900">{atmosphereMonitoring.flammable_gas || '-'}</p>
                <p className="text-xs text-gray-500">(ต้องต่ำกว่า 100% OEL)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">ก๊าซอันตราย</label>
                <p className="text-sm text-gray-900">{atmosphereMonitoring.dangerous_gas || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">อื่นๆ</label>
                <p className="text-sm text-gray-900">{atmosphereMonitoring.other || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attached Files */}
        {files.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">ไฟล์แนบ</h2>
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
                      className="btn-secondary inline-flex items-center text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      ดาวน์โหลด
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">ข้อมูลการอนุมัติ</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">สถานะปัจจุบัน</label>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(permit.approval_status)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">วันที่สร้างใบขอ</label>
                <p className="text-sm text-gray-900">
                  {new Date(permit.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {permit.approval_date && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">วันที่อนุมัติ/ไม่อนุมัติ</label>
                    <p className="text-sm text-gray-900">
                      {new Date(permit.approval_date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">ผู้อนุมัติ</label>
                    <p className="text-sm text-gray-900">{permit.approver_signature || '-'}</p>
                  </div>
                </>
              )}
              
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

        {/* Application Statement */}
        {permit.application_statement && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">คำรับรองของผู้ขอ</h2>
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-900 mb-4">{permit.application_statement}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ลงชื่อผู้ขอ</label>
                  <p className="text-sm text-gray-900">{permit.applicant_signature || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">วันที่ลงชื่อ</label>
                  <p className="text-sm text-gray-900">
                    {permit.application_date ? new Date(permit.application_date).toLocaleDateString('th-TH') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="card bg-gray-50">
          <div className="card-body">
            <h3 className="text-sm font-medium text-gray-500 mb-2">ข้อมูลระบบ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">รหัสใบขอ:</span> {permit.id}
              </div>
              <div>
                <span className="font-medium">สร้างเมื่อ:</span> {new Date(permit.created_at).toLocaleString('th-TH')}
              </div>
              <div>
                <span className="font-medium">อัปเดตล่าสุด:</span> {new Date(permit.updated_at).toLocaleString('th-TH')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}