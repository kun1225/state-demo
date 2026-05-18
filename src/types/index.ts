export type Status = 'idle' | 'loading' | 'success' | 'error'

export type AuthUser = {
  id: string
  name: string
  email: string
}

export type Preferences = {
  theme: 'light' | 'dark'
  lang: 'zh' | 'en'
}

export type UserRole = 'admin' | 'editor' | 'viewer'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export type Todo = {
  id: string
  title: string
  ownerId: string
  lang: 'zh' | 'en'
  done: boolean
}

export type PaginatedUsers = {
  items: User[]
  total: number
  page: number
  pageSize: number
}
