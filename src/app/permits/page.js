'use client'
import { useState, useEffect } from 'react'
import { workPermitApi } from '@/lib/supabase'
import { Search, Filter, Eye, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PermitsListPage() {
  const [permits, setPermits] = useState([])
  const [filteredPermits, setFilteredPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadPermits()
  }, [])

  useEffect(() => {
    filterPermits()
  }, [permits, searchTerm, statusFilter])

  const loadPermits = async () => {
    try {
      const data = await workPermitApi.getAllWorkPermits()
      setPermits(data)
    } catch (error) {
      console.error('Error loading permits:', error)
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const filterPermits = () => {
    let filtered = permits

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(permit =>
        permit.permit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.work_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(permit => permit.approval_status === statusFilter)
    }

    setFilteredPermits(filtered)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning-600'
      case 'approved': return 'text-success-600'
      case 'rejected': return 'text-danger-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/" className="btn-secondary mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการใบขออนุญาต</h1>
            <p className="text-gray-600">ดูและจัดการใบขออนุญาตทำงานทั้งหมด</p>
          </div>
        </div>
        <Link href="/permits/new" className="btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          สร้างใบขอใหม่
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ค้นหา
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่ใบอนุญาต, ชื่อผู้ขอ, ประเภทงาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สถานะ
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">ทั้งหมด</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="approved">อนุมัติ</option>
                <option value="rejected">ไม่อนุมัติ</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="btn-secondary w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            ใบขออนุญาตทั้งหมด ({filteredPermits.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {filteredPermits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เลขที่ใบอนุญาต
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภทงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ผู้ขอ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      บริษัท
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่เริ่มงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สร้าง
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPermits.map((permit) => (
                    <tr key={permit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {permit.permit_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {permit.work_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{permit.applicant_name}</div>
                        {permit.phone_number && (
                          <div className="text-sm text-gray-500">{permit.phone_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{permit.contractor_company || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {permit.start_date ? new Date(permit.start_date).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(permit.approval_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(permit.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/permits/${permit.id}`}
                          className="btn-secondary inline-flex items-center text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          ดู
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-300">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่พบใบขออนุญาต</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'ไม่พบผลลัพธ์ที่ตรงกับเงื่อนไขการค้นหา' 
                  : 'ยังไม่มีใบขออนุญาตในระบบ'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <div className="mt-6">
                  <Link href="/permits/new" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    สร้างใบขออนุญาตแรก
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}