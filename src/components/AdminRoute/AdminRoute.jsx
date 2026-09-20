import React from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { checkIsAdmin } from '../../services/adminService'
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0B8F62] border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const isAdmin = checkIsAdmin(user)

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1520] via-[#141E2E] to-[#0A0F18] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-[#1A2638]/90 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-400">
            <Lock className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> 403 Forbidden
          </span>

          <h2 className="text-2xl font-bold tracking-tight mb-2">Admin Access Required</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            The BharatLingo Administration Console is restricted to authorized personnel. Your current account (<span className="text-gray-200 font-mono text-xs">{user.email}</span>) does not have administrative clearance.
          </p>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0B8F62] to-[#056041] hover:from-[#0DA773] hover:to-[#087752] text-white font-medium text-sm transition-all shadow-lg hover:shadow-emerald-900/30"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Learner Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
