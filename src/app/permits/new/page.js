'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { workPermitApi } from '@/lib/supabase'
import { ArrowLeft, Upload, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewPermitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [formData, setFormData] = useState({
    work_type: '',
    start_date: '',
    start_time: '',
    applicant_name: '',
    phone_number: '',
    contractor_company: '',
    supervisor_name: '',
    project_manager: '',
    work_location: '',
    worker_count: 1,
    worker_names: '',
    tools_equipment: '',
    work_details: {
      grinding: false,
      electric_welding: false,
      gas_welding: false,
      gas_type: '',
      drilling: false,
      other: false,
      other_detail: ''
    },
    special_work_type: {
      confined_space: false,
      height_work: false,
      other: false,
      other_detail: ''
    },
    related_documents: {
      jsa: false,
      safety_measures: false,
      sds: false,
      sds_chemicals: '',
      other_docs: false,
      other_docs_detail: ''
    },
    safety_compliance: {
      system_isolation: false,
      lockout_tagout: false,
      warning_signs: false,
      tool_inspection: false,
      gas_tank_inspection: false,
      fire_equipment: false,
      proper_clothing: false,
      area_barriers: false,
      atmosphere_monitoring: false,
      ventilation_system: false,
      additional_requirements: ''
    },
    ppe_requirements: {
      basic_ppe: false,
      dust_mask: false,
      welding_mask: false,
      safety_glasses: false,
      ear_protection: false,
      welding_gloves: false,
      hearing_protection: false,
      safety_harness: false,
      fire_resistant_clothing: false,
      canvas_sling: false,
      other_ppe: ''
    },
    fire_extinguisher_needed: false,
    fire_extinguisher_reason: '',
    fire_extinguisher_count: 0,
    fire_extinguisher_types: {
      water: false,
      foam: false,
      dry_chemical: false,
      co2: false
    },
    atmosphere_monitoring: {
      oxygen_level: '',
      dangerous_gas: '',
      flammable_gas: '',
      other: ''
    }
  })

  const workTypes = [
    'งานที่ก่อให้เกิดความร้อนหรือประกายไฟ (Hot Work)',
    'งานในที่อับอากาศ (Confined Space)',
    'งานบนที่สูง (Work at Height)',
    'งานไฟฟ้า (Electrical Work)',
    'งานเชื่อมและตัด (Welding & Cutting)',
    'งานขุดเจาะ (Excavation Work)',
    'งานใช้สารเคมี (Chemical Work)',
    'งานอื่นๆ'
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create work permit
      const permitData = {
        ...formData,
        work_details: JSON.stringify(formData.work_details),
        special_work_type: JSON.stringify(formData.special_work_type),
        related_documents: JSON.stringify(formData.related_documents),
        safety_compliance: JSON.stringify(formData.safety_compliance),
        ppe_requirements: JSON.stringify(formData.ppe_requirements),
        fire_extinguisher_types: JSON.stringify(formData.fire_extinguisher_types),
        atmosphere_monitoring: JSON.stringify(formData.atmosphere_monitoring),
        application_date: new Date().toISOString(),
        approval_status: 'pending'
      }

      const newPermit = await workPermitApi.createWorkPermit(permitData)

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          await workPermitApi.uploadFile(file, newPermit.id)
        }
      }

      alert('สร้างใบขออนุญาตสำเร็จ!')
      router.push(`/permits/${newPermit.id}`)
    } catch (error) {
      console.error('Error creating permit:', error)
      alert('เกิดข้อผิดพลาดในการสร้างใบขออนุญาต')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/" className="btn-secondary mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          กลับ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">สร้างใบขออนุญาตทำงานใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">ข้อมูลพื้นฐาน</h2>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทงาน *
                </label>
                <select
                  name="work_type"
                  value={formData.work_type}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">เลือกประเภทงาน</option>
                  {workTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เริ่มปฏิบัติงาน *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เวลาเริ่มต้นโดยประมาณ *
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อผู้ขอใบอนุญาต (ชื่อ-สกุล) *
                </label>
                <input
                  type="text"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเลขโทรศัพท์
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ใบอนุญาตที่ผ่านการอบรม
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="btn-primary cursor-pointer">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      เลือกไฟล์
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    รองรับไฟล์ PDF, JPG, PNG, DOC, DOCX (ขนาดไม่เกิน 10MB)
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ลบ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  บริษัทผู้รับเหมา
                </label>
                <input
                  type="text"
                  name="contractor_company"
                  value={formData.contractor_company}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อหัวหน้างาน
                </label>
                <input
                  type="text"
                  name="supervisor_name"
                  value={formData.supervisor_name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อผู้จัดการโครงการ
                </label>
                <input
                  type="text"
                  name="project_manager"
                  value={formData.project_manager}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานที่และพื้นที่ปฏิบัติงาน
                </label>
                <textarea
                  name="work_location"
                  value={formData.work_location}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนผู้ปฏิบัติงาน
                </label>
                <input
                  type="number"
                  name="worker_count"
                  value={formData.worker_count}
                  onChange={handleInputChange}
                  min="1"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายชื่อผู้ปฏิบัติงาน
                </label>
                <textarea
                  name="worker_names"
                  value={formData.worker_names}
                  onChange={handleInputChange}
                  rows={3}
                  className="form-textarea"
                  placeholder="ระบุรายชื่อผู้ปฏิบัติงานทุกคน"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">รายละเอียดของงาน</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="work_details.grinding"
                  checked={formData.work_details.grinding}
                  onChange={handleInputChange}
                  className="form-checkbox mr-2"
                />
                เจียร/ตัด
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="work_details.electric_welding"
                  checked={formData.work_details.electric_welding}
                  onChange={handleInputChange}
                  className="form-checkbox mr-2"
                />
                เชื่อม/ตัดด้วยไฟฟ้า
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="work_details.gas_welding"
                  checked={formData.work_details.gas_welding}
                  onChange={handleInputChange}
                  className="form-checkbox mr-2"
                />
                เชื่อม/ตัดด้วยก๊าซ
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="work_details.drilling"
                  checked={formData.work_details.drilling}
                  onChange={handleInputChange}
                  className="form-checkbox mr-2"
                />
                เจาะ/ขุด
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="work_details.other"
                  checked={formData.work_details.other}
                  onChange={handleInputChange}
                  className="form-checkbox mr-2"
                />
                อื่นๆ
              </label>
            </div>

            {formData.work_details.gas_welding && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชนิดก๊าซ
                </label>
                <input
                  type="text"
                  name="work_details.gas_type"
                  value={formData.work_details.gas_type}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="ระบุชนิดก๊าซ"
                />
              </div>
            )}

            {formData.work_details.other && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียดอื่นๆ
                </label>
                <input
                  type="text"
                  name="work_details.other_detail"
                  value={formData.work_details.other_detail}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="โปรดระบุ"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เครื่องมืออุปกรณ์ที่ใช้ทำงาน
              </label>
              <textarea
                name="tools_equipment"
                value={formData.tools_equipment}
                onChange={handleInputChange}
                rows={3}
                className="form-textarea"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Special Work Permits */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">ส่วนที่ 2: ใบอนุญาตทำงานเฉพาะ</h2>
          </div>
          <div className="card-body space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">ลักษณะงาน</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="special_work_type.confined_space"
                    checked={formData.special_work_type.confined_space}
                    onChange={handleInputChange}
                    className="form-checkbox mr-2"
                  />
                  ทำงานในที่อับอากาศ
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="special_work_type.height_work"
                    checked={formData.special_work_type.height_work}
                    onChange={handleInputChange}
                    className="form-checkbox mr-2"
                  />
                  ทำงานบนที่สูง
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="special_work_type.other"
                    checked={formData.special_work_type.other}
                    onChange={handleInputChange}
                    className="form-checkbox mr-2"
                  />
                  อื่นๆ
                </label>
              </div>

              {formData.special_work_type.other && (
                <div className="mt-4">
                  <input
                    type="text"
                    name="special_work_type.other_detail"
                    value={formData.special_work_type.other_detail}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="โปรดระบุ"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">เอกสารที่เกี่ยวข้อง</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="related_documents.jsa"
                    checked={formData.related_documents.jsa}
                    onChange={handleInputChange}
                    className="form-checkbox mr-2"
                  />
                  การวิเคราะห์งานเพื่อความปลอดภัย (JSA)
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="related_documents.safety_measures"
                    checked={formData.related_documents.safety_measures}
                    onChange={handleInputChange}
                    className="form-checkbox mr-2"
                  />
                  มาตรการความปลอดภัย
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="related_documents.sds"
                    checked={formData.related_documents.sds}
                    onChange={handleInputChange}
                    className="form-checkbox mr-2"
                  />
                  ข้อมูลความปลอดภัยสารเคมี (SDS)
                </label>

                {formData.related_documents.sds && (
                  <div className="ml-6">
                    <input
                      type="text"
                      name="related_documents.sds_chemicals"
                      value={formData.related_documents.sds_chemicals}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="ระบุสารเคมี"
                    />
                  </div>
                )}

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="related_documents.other_docs"
                    checked={formData.related_documents.other_docs}
                    onChange={handleInputChange}
                    className="form-checkbox mr-2"
                  />
                  เอกสารอื่นๆ
                </label>

                {formData.related_documents.other_docs && (
                  <div className="ml-6">
                    <input
                      type="text"
                      name="related_documents.other_docs_detail"
                      value={formData.related_documents.other_docs_detail}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="ระบุเอกสารอื่นๆ"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/" className="btn-secondary">
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                บันทึกใบขออนุญาต
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}