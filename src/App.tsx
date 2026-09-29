import { useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { BookOpen, FileText, Home, MessageSquare, Moon, Sun, User as UserIcon } from 'lucide-react'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { HomePage } from '@/pages/HomePage'
import { useStore } from '@/store'
import { ROLE_LABEL } from '@/types'

// Пока готовы только «Главная» и «Документы»; остальные модули добавятся позже.
const NAV = [
  { label: 'Главная', icon: Home, to: '/' },
  { label: 'Документы', icon: FileText, to: '/documents' },
  { label: 'Сообщения', icon: MessageSquare },
  { label: 'Обучение', icon: BookOpen },
  { label: 'Профиль', icon: UserIcon },
]

const itemClass =
  'flex min-h-11 flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs hover:bg-white/10 md:flex-row md:gap-3 md:text-sm'

export default function App() {
  const { user, users, switchUser } = useStore()
  const [dark, setDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-svh md:flex">
      <nav
        aria-label="Основная навигация"
        className="fixed inset-x-0 bottom-0 z-10 flex justify-around bg-panel p-1 text-panel-fg md:sticky md:top-0 md:h-svh md:w-60 md:flex-col md:justify-start md:gap-1 md:p-4"
      >
        <p className="hidden px-3 pb-4 text-xl font-bold md:block">Orda</p>
        {NAV.map(({ label, icon: Icon, to }) =>
          to ? (
            <NavLink
              key={label}
              to={to}
              end
              className={({ isActive }) => `${itemClass} ${isActive ? 'bg-white/15' : ''}`}
            >
              <Icon size={18} aria-hidden /> {label}
            </NavLink>
          ) : (
            <button
              key={label}
              type="button"
              disabled
              title="Скоро"
              className={`${itemClass} cursor-not-allowed opacity-50 hover:bg-transparent`}
            >
              <Icon size={18} aria-hidden /> {label}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          className={`${itemClass} md:mt-auto`}
        >
          {dark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          <span className="hidden md:inline">Тема</span>
        </button>
      </nav>

      <main className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-card px-4 py-3 md:px-8">
          <div>
            <p className="text-sm text-muted">
              {user.department} · {ROLE_LABEL[user.role]}
            </p>
            <p className="font-semibold">Здравствуйте, {user.name}</p>
          </div>
          {/* Только для демо, пока нет входа через Firebase Auth */}
          <label className="text-xs text-muted">
            Демо: войти как
            <select
              value={user.id}
              onChange={(e) => switchUser(e.target.value)}
              className="ml-2 min-h-11 rounded-lg border border-line bg-card px-2 text-sm text-card-fg"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {ROLE_LABEL[u.role]}, {u.department}
                </option>
              ))}
            </select>
          </label>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
        </Routes>
      </main>
    </div>
  )
}
