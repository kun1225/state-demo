'use client'

import { UserProvider, useUser } from '@/store/context/user-provider'

function Header() {
  const { user } = useUser()
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="font-semibold">Logo</span>
      <span className="text-sm text-gray-500">{user ? user.name : '...'}</span>
    </header>
  )
}

function Sidebar() {
  const { preferences, updatePreferences } = useUser()
  return (
    <aside className="w-48 border-r px-4 py-6 flex flex-col gap-4">
      <p className="text-xs text-gray-400">theme: {preferences.theme}</p>
      <button
        className="text-sm underline"
        onClick={() => updatePreferences({ theme: preferences.theme === 'light' ? 'dark' : 'light' })}
      >
        Toggle theme
      </button>
    </aside>
  )
}

function Settings() {
  const { user, status, error, updateUser, logout } = useUser()

  if (status === 'loading') return <p className="p-6 text-sm">Loading...</p>
  if (status === 'error') return <p className="p-6 text-sm text-red-500">{error}</p>
  if (!user) return null

  return (
    <main className="flex-1 p-6 flex flex-col gap-4">
      <h1 className="text-lg font-bold">Settings</h1>

      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          className="border rounded px-2 py-1 w-64"
          defaultValue={user.name}
          onBlur={(e) => {
            if (e.target.value !== user.name) updateUser({ name: e.target.value })
          }}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          className="border rounded px-2 py-1 w-64"
          defaultValue={user.email}
          onBlur={(e) => {
            if (e.target.value !== user.email) updateUser({ email: e.target.value })
          }}
        />
      </label>

      <button
        className="mt-4 w-32 rounded bg-red-500 px-3 py-1.5 text-sm text-white"
        onClick={logout}
      >
        Logout
      </button>
    </main>
  )
}

export default function ContextPage() {
  return (
    <UserProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Settings />
        </div>
      </div>
    </UserProvider>
  )
}
