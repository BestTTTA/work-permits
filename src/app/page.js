'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { workPermitApi } from '@/lib/supabase'
import { FileText, Users, CheckCircle, XCircle, Clock, Plus } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [recentPermits, setRecentPermits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const permits = await workPermitApi.getAllWorkPermits()
      
      // Calculate stats
      const stats = {
        total: permits.length,
        pending: permits.filter(p => p.approval_status === 'pending').length,
        approved: permits.filter(p => p.approval_status === 'approved').length,
        rejected: permits.filter(p => p.approval_status === 'rejected').length
      }
      
      setStats(stats)
      setRecentPermits(permits.slice(0, 5)) // Show last 5 permits
    } catch (error) {
      console.error('Error loading data:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold text-gray-900">Document Management</p>
        </div>
        <Link href="/permits/new" className="btn-primary inline-flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          สร้างใบขอใหม่
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ใบขอทั้งหมด
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    รอดำเนินการ
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pending}
                  </dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    อนุมัติแล้ว
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.approved}
                  </dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    ไม่อนุมัติ
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.rejected}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/permits/new" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-primary-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">สร้างใบขออนุญาตใหม่</h3>
            <p className="text-gray-500 mt-2">เริ่มต้นขอใบอนุญาทำงานใหม่</p>
          </div>
        </Link>

        {/* <Link href="/permits" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center py-8">
            <Users className="h-12 w-12 mx-auto text-success-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">จัดการใบขอ</h3>
            <p className="text-gray-500 mt-2">ดูและจัดการใบขออนุญาตทั้งหมด</p>
          </div>
        </Link> */}

        <Link href="/admin" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-warning-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
            <p className="text-gray-500 mt-2">อนุมัติ/ไม่อนุมัติใบขอต่างๆ</p>
          </div>
        </Link>
      </div>

      {/* Recent Permits */}
      {/* <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">ใบขออนุญาตล่าสุด</h3>
        </div>
        <div className="card-body p-0">
          {recentPermits.length > 0 ? (
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
                  {recentPermits.map((permit) => (
                    <tr key={permit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {permit.permit_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {permit.work_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {permit.applicant_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(permit.approval_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(permit.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/permits/${permit.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">ยังไม่มีใบขออนุญาต</p>
            </div>
          )}
        </div>
      </div> */}
    </div>
  )
}