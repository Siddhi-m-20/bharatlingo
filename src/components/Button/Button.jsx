import { motion } from 'framer-motion'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-[#0B8F62] text-white hover:bg-[#0FB878] focus:ring-[#0B8F62]',
    secondary: 'bg-[#F39A45] text-white hover:bg-[#F7B670] focus:ring-[#F39A45]',
    outline: 'border-2 border-[#0B8F62] text-[#0B8F62] hover:bg-[#0B8F62] hover:text-white focus:ring-[#0B8F62]',
    danger: 'bg-[#D84B42] text-white hover:bg-[#E85D54] focus:ring-[#D84B42]',
    ghost: 'text-[#0B8F62] hover:bg-[#0B8F62]/10 focus:ring-[#0B8F62]',
  }
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }
  
  const disabledStyles = disabled || loading 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer'
  
  return (
    <motion.button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
