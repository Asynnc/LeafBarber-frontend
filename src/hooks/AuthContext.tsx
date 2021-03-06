import React, { createContext, useCallback, useState, useContext } from 'react'
import api from '../services/api'

interface AuthState {
  token: string;
  user: object
}

interface SignInCredenticals {
  email: string;
  password: string;
}

interface AuthContextData {
  user: object;
  signIn(credentials: SignInCredenticals): Promise<void>
  signOut(): void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC = ({ children }) => {

  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@LeafBarber:token')
    const user = localStorage.getItem('@LeafBarber:user')

    if (token && user) {
      return { token, user: JSON.parse(user) }
    }
    return {} as AuthState
  })

  const signIn = useCallback(async ({ email, password }) => {
    //Para fazermos a autenticação precisamos receber as credenciais
    const response = await api.post('/sessions', {
      email,
      password
    })


    const { token, user } = response.data

    localStorage.setItem('@LeafBarber:token', token)
    localStorage.setItem('@LeafBarber:user', JSON.stringify(user))

    setData({ token, user })

  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('@LeafBarber:token')
    localStorage.removeItem('@LeafBarber:user')

    setData({} as AuthState)
  }, [])


  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider')
  }

  return context
}

