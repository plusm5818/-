import { useState } from 'react'
import { Bell, CheckCircle2, CheckCheck, CircleDashed, FileText, History } from 'lucide-react'
import { daysLeft } from '@/components/AttentionCard'
import { useStore } from '@/store'
import type { OrdaDocument } from '@/types'
import { cn } from '@/lib/utils'

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function DocumentsPage() {
  const { docs, isAdmin } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const open = docs.find((d) => d.id === openId)

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <h2 className="mb-4 text-xl font-semibold">Документы</h2>
      {docs.length === 0 && <p className="text-sm text-muted">Для вашего отдела документов нет.</p>}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <ul className="space-y-2">
          {docs.map((d) => (
            <DocRow key={d.id} doc={d} selected={d.id === openId} onOpen={() => setOpenId(d.id === openId ? null : d.id)} />
          ))}
        </ul>
        {open ? (
          isAdmin ? <AdminControl doc={open} /> : <EmployeeView doc={open} />
        ) : (
          <p className="hidden rounded-xl border border-dashed border-line p-6 text-sm text-muted lg:block">
            Выберите документ, чтобы увидеть детали.
          </p>
        )}
      </div>
    </div>
  )
}

function DocRow({ doc, selected, onOpen }: { doc: OrdaDocument; selected: boolean; onOpen: () => void }) {
  const { user, hasAcked, isAdmin } = useStore()
  const done = hasAcked(user.id, doc)
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        aria-expanded={selected}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left',
          selected ? 'border-accent' : 'border-line',
        )}
      >
        <FileText size={20} className="shrink-0 text-muted" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{doc.title}</span>
          <span className="text-xs text-muted">
            v{doc.version}
            {doc.mandatory ? ' · обязательный' : ' · для информации'}
            {doc.dueDate && ` · до ${new Date(doc.dueDate).toLocaleDateString('ru-RU')}`}
          </span>
        </span>
        {doc.status === 'draft' && (
          <span className="rounded-full bg-warn-bg px-2 py-0.5 text-xs font-medium text-warn">Черновик</span>
        )}
        {!isAdmin && doc.mandatory && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              done ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn',
            )}
          >
            {done ? <CheckCircle2 size={12} aria-hidden /> : <CircleDashed size={12} aria-hidden />}
            {done ? 'Ознакомлен' : 'Не ознакомлен'}
          </span>
        )}
      </button>
    </li>
  )
}

function EmployeeView({ doc }: { doc: OrdaDocument }) {
  const { user, hasAcked, ackedVersion, acknowledge, acks } = useStore()
  const done = hasAcked(user.id, doc)
  const mine = acks.find((a) => a.userId === user.id && a.docId === doc.id && a.version === doc.version)
  const prev = ackedVersion(user.id, doc.id)

  return (
    <section aria-label={doc.title} className="rounded-xl border border-line bg-card p-4">
      <h3 className="font-semibold">{doc.title}</h3>
      <p className="mt-1 text-sm text-muted">Версия {doc.version}</p>
      {done && mine ? (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-ok">
          <CheckCircle2 size={16} aria-hidden /> Вы подтвердили версию {mine.version}, {fmt(mine.at)}
        </p>
      ) : doc.mandatory ? (
        <>
          {prev !== undefined && (
            <p className="mt-2 text-sm text-warn">Вы читали версию {prev}. Вышла новая, нужно подтвердить заново.</p>
          )}
          <button
            type="button"
            onClick={() => acknowledge(doc.id)}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90"
          >
            <CheckCheck size={16} aria-hidden /> Прочитал и подтверждаю
          </button>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">Документ для информации, подтверждение не требуется.</p>
      )}
    </section>
  )
}

function AdminControl({ doc }: { doc: OrdaDocument }) {
  const { recipients, hasAcked, ackedVersion, acks, remindersFor, remind } = useStore()
  const [notice, setNotice] = useState('')

  const people = recipients(doc)
  const status = people.map((p) => {
    const ack = acks.find((a) => a.userId === p.id && a.docId === doc.id && a.version === doc.version)
    const sent = remindersFor(doc.id, p.id).filter((r) => r.version === doc.version)
    return { p, done: hasAcked(p.id, doc), ack, old: ackedVersion(p.id, doc.id), lastReminder: sent.at(-1)?.sentAt }
  })
  const missing = status.filter((s) => !s.done)
  const overdue = doc.dueDate !== undefined && daysLeft(doc.dueDate) < 0
  const percent = people.length ? Math.round(((people.length - missing.length) / people.length) * 100) : 0

  const send = (ids: string[], msg: string) => {
    remind(doc, ids)
    setNotice(msg)
  }

  if (doc.status === 'draft') {
    return (
      <section className="rounded-xl border border-line bg-card p-4 text-sm text-muted">
        Черновик не опубликован: сотрудники его не видят, ознакомление и напоминания недоступны.
      </section>
    )
  }
  if (!doc.mandatory) {
    return (
      <section className="rounded-xl border border-line bg-card p-4 text-sm text-muted">
        Документ для информации: подтверждение не требуется.
      </section>
    )
  }

  return (
    <section aria-label={`Контроль ознакомления: ${doc.title}`} className="space-y-4 rounded-xl border border-line bg-card p-4">
      <div>
        <h3 className="font-semibold">Кто не ознакомился</h3>
        <p className="mt-1 text-sm text-muted">
          Версия {doc.version} · ознакомились {people.length - missing.length} из {people.length} ({percent}%)
          {overdue && <span className="font-medium text-danger"> · срок прошёл</span>}
        </p>
        <div
          role="progressbar"
          aria-label="Доля ознакомившихся"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-2 h-2 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <button
        type="button"
        disabled={missing.length === 0}
        onClick={() =>
          send(
            missing.map((m) => m.p.id),
            `Напоминание отправлено: ${missing.length}`,
          )
        }
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Bell size={16} aria-hidden /> Напомнить всем, кто не ознакомился ({missing.length})
      </button>
      <p role="status" className="min-h-5 text-sm text-ok">{notice}</p>

      <ul className="divide-y divide-line">
        {status.map(({ p, done, ack, old, lastReminder }) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{p.name}</span>
              <span className="text-xs text-muted">{p.department}</span>
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                done ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn',
              )}
            >
              {done ? <CheckCircle2 size={12} aria-hidden /> : <CircleDashed size={12} aria-hidden />}
              {done && ack
                ? `Ознакомлен v${ack.version}, ${fmt(ack.at)}`
                : old !== undefined
                  ? `Читал только v${old}`
                  : 'Не ознакомлен'}
            </span>
            {!done && (
              <>
                {lastReminder && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <History size={12} aria-hidden /> напомнено {fmt(lastReminder)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => send([p.id], `Напоминание отправлено: ${p.name}`)}
                  aria-label={`Напомнить: ${p.name}`}
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line px-3 text-sm hover:bg-bg"
                >
                  <Bell size={14} aria-hidden /> Напомнить
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
