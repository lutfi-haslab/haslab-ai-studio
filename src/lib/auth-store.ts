import { Store } from '@tanstack/store'
import ENV from './env'

const STORAGE_KEY = 'haslab-auth-token'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
}

const loadInitialState = (): AuthState => {
  const storedToken = localStorage.getItem(STORAGE_KEY)
  return {
    isAuthenticated: !!storedToken,
    token: storedToken,
  }
}

export const authStore = new Store<AuthState>(loadInitialState())

export const login = (password: string): boolean => {
  if (password === ENV.AUTH_PASSWORD) {
    const token = btoa(`authenticated-${Date.now()}`)
    localStorage.setItem(STORAGE_KEY, token)
    authStore.setState(() => ({
      isAuthenticated: true,
      token,
    }))
    return true
  }
  return false
}

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY)
  authStore.setState(() => ({
    isAuthenticated: false,
    token: null,
  }))
}

export const checkAuth = (): boolean => {
  return authStore.state.isAuthenticated
}
