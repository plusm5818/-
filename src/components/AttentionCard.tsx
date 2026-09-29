import { AlertTriangle, CheckCheck, Clock, FileText } from 'lucide-react'
import type { OrdaDocument } from '@/types'
import { cn } from '@/lib/utils'

const DAY = 86_400_000

export function daysLeft(dueDate: string, now = new Date()) {
  return Math.ceil((new Date(dueDate).getTime() - now.getTime()) / DAY)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

interface Props {
  doc: OrdaDocument
  ackedVersion?: number
  onAcknowledge: (id: string) => void
}

/** Обязательный документ: рамка слева, бейдж со значком и текстом, кнопка подтверждения. */
export function AttentionCard({ doc, ackedVersion, onAcknowledge }: Props) {
  const left = doc.dueDate ? daysLeft(doc.dueDate) : null
  const overdue = left !== null && left < 0
  const isNewVersion = ackedVersion !== undefined && ackedVersion < doc.version

  return (
    <li
      className={cn(
        'rounded-xl border border-line border-l-4 bg-card p-4 text-card-fg shadow-sm',
        overdue ? 'border-l-danger' : 'border-l-accent',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-accent-fg">
          <FileText size={12} aria-hidden /> Обязательно
        </span>
        {isNewVersion && (
          <span className="rounded-full bg-warn-bg px-2 py-0.5 text-warn">Новая версия v{doc.version}</span>
        )}
        {left !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
              overdue ? 'bg-danger-bg text-danger' : 'bg-warn-bg text-warn',
            )}
          >
            {overdue ? <AlertTriangle size={12} aria-hidden /> : <Clock size={12} aria-hidden />}
            {overdue ? `Просрочено на ${Math.abs(left)} дн.` : `Осталось ${left} дн.`}
          </span>
        )}
      </div>

      <h3 className="mt-2 text-base font-semibold">{doc.title}</h3>
      <p className="text-sm text-muted">
        Версия {doc.version}
        {doc.dueDate && ` · срок до ${formatDate(doc.dueDate)}`}
      </p>

      <button
        type="button"
        onClick={() => onAcknowledge(doc.id)}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90"
      >
        <CheckCheck size={16} aria-hidden /> Прочитал и подтверждаю
      </button>
    </li>
  )
}
