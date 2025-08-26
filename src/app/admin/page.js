'use client'
import { useState, useEffect } from 'react'
import { workPermitApi } from '@/lib/supabase'
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [permits, setPermits] = useState([])
  const [filteredPermits, setFilteredPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [actionLoading, setActionLoading] = useState(null)

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

  const handleApproval = async (permitId, status, reason = null) => {
    if (!confirm(`คุณต้องการ${status === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'}ใบขอนี้ใช่หรือไม่?`)) {
      return
    }

    setActionLoading(permitId)
    try {
      const signature = prompt('กรุณาใส่ชื่อผู้อนุมัติ:')
      if (!signature) return

      await workPermitApi.updateApprovalStatus(permitId, status, reason, signature)
      await loadPermits() // Reload data
      alert(`${status === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'}ใบขอสำเร็จ`)
    } catch (error) {
      console.error('Error updating approval:', error)
      alert('เกิดข้อผิดพลาดในการอัปเดต')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = (permitId) => {
    const reason = prompt('กรุณาระบุเหตุผลที่ไม่อนุมัติ:')
    if (reason) {
      handleApproval(permitId, 'rejected', reason)
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

  const getStats = () => {
    return {
      total: permits.length,
      pending: permits.filter(p => p.approval_status === 'pending').length,
      approved: permits.filter(p => p.approval_status === 'approved').length,
      rejected: permits.filter(p => p.approval_status === 'rejected').length
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/" className="btn-secondary mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับ
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel - จัดการใบขออนุญาต</h1>
            <p className="text-gray-600">อนุมัติ/ไม่อนุมัติใบขออนุญาตทำงาน</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ใบขอทั้งหมด</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-warning-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">รอดำเนินการ</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-success-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">อนุมัติแล้ว</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-danger-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">ไม่อนุมัติ</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="rejected">ไม่อนุมัติ</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('pending')
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

      {/* Permits Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            รายการใบขออนุญาต ({filteredPermits.length})
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
                      วันที่เริ่มงาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่สร้าง
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {permit.start_date ? new Date(permit.start_date).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(permit.approval_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(permit.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/admin/permits/${permit.id}`}
                            className="btn-secondary inline-flex items-center text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            ดู
                          </Link>
                          
                          {permit.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproval(permit.id, 'approved')}
                                disabled={actionLoading === permit.id}
                                className="btn-success inline-flex items-center text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => handleReject(permit.id)}
                                disabled={actionLoading === permit.id}
                                className="btn-danger inline-flex items-center text-xs"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                ไม่อนุมัติ
                              </button>
                            </>
                          )}
                          
                          {actionLoading === permit.id && (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            </div>
                          )}
                        </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}