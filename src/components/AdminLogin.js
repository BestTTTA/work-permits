'use client'
import { useState } from 'react'
import { Lock, Eye, EyeOff, Shield } from 'lucide-react'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // รหัสผ่าน Admin (ในการใช้งานจริง ควรเก็บใน environment variable)
  const ADMIN_PASSWORDS = [
    'admin123',
    'safety2024'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // จำลองการตรวจสอบรหัสผ่าน
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (ADMIN_PASSWORDS.includes(password)) {
      // เก็บสถานะการเข้าสู่ระบบใน localStorage
      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('adminAuthTime', Date.now().toString())
      onLogin(true)
    } else {
      setError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-100 p-3 rounded-full">
            <Shield className="h-12 w-12 text-primary-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          เข้าสู่ระบบ Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ระบบจัดการใบอนุญาตทำงาน
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder="กรุณาใส่รหัสผ่าน"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-full btn-primary flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    เข้าสู่ระบบ
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ข้อมูลสำหรับทดสอบ</span>
              </div>
            </div> */}

            {/* <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">รหัสผ่านสำหรับทดสอบ:</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <div className="font-mono">admin123</div>
                  <div className="font-mono">safety2024</div>
                  <div className="font-mono">workpermit@admin</div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  * ใช้รหัสใดรหัสหนึ่งข้างบนสำหรับการทดสอบ
                </p>
              </div>
            </div> */}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            ระบบความปลอดภัยสำหรับเจ้าหน้าที่ความปลอดภัยเท่านั้น
          </p>
        </div>
      </div>
    </div>
  )
}