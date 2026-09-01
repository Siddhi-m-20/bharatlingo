import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import Button from '../../components/Button'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const successMessage = location.state?.successMessage
  const prefillEmail = location.state?.email || ''

  const [formData, setFormData] = useState({
    email: prefillEmail,
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (prefillEmail) {
      setFormData(prev => ({ ...prev, email: prefillEmail }))
    }
  }, [prefillEmail])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setLoading(true)
    try {
      const loggedUser = await login(formData.email, formData.password)
      // Check if user has completed onboarding
      if (loggedUser?.learningLanguage) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (error) {
      setErrors({ general: error.message || 'Invalid email or password' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[#0B8F62] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              भा
            </div>
            <h1 className="text-2xl font-bold text-[#25231F] mb-2">Welcome back</h1>
            <p className="text-[#77736B]">Log in to continue learning</p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-[#0B8F62]/10 border border-[#0B8F62] rounded-lg text-[#0B8F62] text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-[#D84B42]/10 border border-[#D84B42] rounded-lg text-[#D84B42] text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#25231F] mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B8F62] ${
                  errors.email ? 'border-[#D84B42]' : 'border-[#E8E6E0]'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-[#D84B42]">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#25231F] mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B8F62] ${
                  errors.password ? 'border-[#D84B42]' : 'border-[#E8E6E0]'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-[#D84B42]">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-[#0B8F62] border-[#E8E6E0] rounded focus:ring-[#0B8F62]" />
                <span className="ml-2 text-sm text-[#77736B]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#0B8F62] hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" size="large" loading={loading} className="w-full">
              Log in
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E6E0]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#77736B]">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" size="large" className="w-full">
              Continue with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#77736B]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#0B8F62] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
