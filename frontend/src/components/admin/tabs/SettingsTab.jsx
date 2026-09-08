import { ShieldCheck, Mail, Bell } from 'lucide-react'

export default function SettingsTab({ adminEmail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Account Security</h3>
            <p className="text-gray-500 text-sm">Manage how you sign in to the admin panel</p>
          </div>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={15} className="text-gray-400" /> Admin Email
          </div>
          <span className="text-sm font-semibold text-gray-800">{adminEmail}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <span className="text-sm text-gray-600">Email + OTP Login</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Enabled</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
          >
            <Bell size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <p className="text-gray-500 text-sm">Choose what you get notified about</p>
          </div>
        </div>
        {['New orders', 'Low stock alerts', 'New customer sign-ups'].map((label) => (
          <div key={label} className="flex items-center justify-between py-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">{label}</span>
            <div className="w-10 h-5.5 rounded-full p-0.5 cursor-pointer" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
              <div className="w-4.5 h-4.5 bg-white rounded-full ml-auto shadow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
