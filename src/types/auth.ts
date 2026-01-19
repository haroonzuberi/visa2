export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  name: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
} 