import { CalendarDays, Megaphone } from 'lucide-react'
import { AttentionCard, daysLeft } from '@/components/AttentionCard'
import { news } from '@/data/mock'
import { useStore } from '@/store'

export function HomePage() {
  const { user, docs, hasAcked, ackedVersion, acknowledge } = useStore()

  // Требует внимания: опубликованное обязательное для отдела пользователя, ещё не подтверждённое в актуальной версии.
  const pending = docs
    .filter(
      (d) =>
        d.status === 'published' &&
        d.mandatory &&
        d.departments.includes(user.department) &&
        !hasAcked(user.id, d),
    )
    .sort((a, b) => daysLeft(a.dueDate ?? '9999-12-31') - daysLeft(b.dueDate ?? '9999-12-31'))

  const visibleNews = news.filter((n) => !n.department || n.department === user.department)

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-8">
      <section aria-labelledby="attention">
        <h2 id="attention" className="mb-3 text-xl font-semibold">
          Требует внимания {pending.length > 0 && <span className="text-muted">({pending.length})</span>}
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-xl border border-line bg-card p-4 text-sm text-muted">
            Всё прочитано. Обязательных документов нет.
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map((d) => (
              <AttentionCard
                key={d.id}
                doc={d}
                ackedVersion={ackedVersion(user.id, d.id)}
                onAcknowledge={acknowledge}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="news">
        <h2 id="news" className="mb-3 text-xl font-semibold">Новости и события</h2>
        <ul className="space-y-3">
          {visibleNews.map((n) => (
            <li key={n.id} className="rounded-xl border border-line bg-card p-4">
              <p className="flex items-center gap-1 text-xs font-medium text-muted">
                {n.kind === 'event' ? <CalendarDays size={12} aria-hidden /> : <Megaphone size={12} aria-hidden />}
                {n.kind === 'event' ? 'Событие' : 'Новость'}
                {n.department ? ` · ${n.department}` : ' · Вся организация'}
              </p>
              <h3 className="mt-1 font-semibold">{n.title}</h3>
              <p className="text-sm text-muted">{n.summary}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
