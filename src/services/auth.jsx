import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('bharatlingo_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const mockUser = {
      id: '1',
      name: email.split('@')[0],
      email,
      preferredLanguage: 'en',
      learningLanguage: null,
      level: 'beginner',
      dailyGoal: 10,
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      vocabulary: {},
      achievements: [],
    }
    setUser(mockUser)
    localStorage.setItem('bharatlingo_user', JSON.stringify(mockUser))
    return mockUser
  }

  const signup = (name, email, password) => {
    const mockUser = {
      id: Date.now().toString(),
      name,
      email,
      preferredLanguage: 'en',
      learningLanguage: null,
      level: 'beginner',
      dailyGoal: 10,
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      vocabulary: {},
      achievements: [],
    }
    setUser(mockUser)
    localStorage.setItem('bharatlingo_user', JSON.stringify(mockUser))
    return mockUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('bharatlingo_user')
  }

  const updateUser = (updates) => {
    setUser(prev => {
      const resolved = typeof updates === 'function' ? updates(prev) : updates
      const updatedUser = { ...prev, ...resolved }
      localStorage.setItem('bharatlingo_user', JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
