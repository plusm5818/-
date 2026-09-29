export type Role = 'employee' | 'deptAdmin' | 'superAdmin'

export const DEPARTMENTS = [
  'Отдел кадров',
  'Бухгалтерия',
  'IT-отдел',
  'Юридический отдел',
  'Отдел маркетинга',
] as const
export type Department = (typeof DEPARTMENTS)[number]

export const ROLE_LABEL: Record<Role, string> = {
  employee: 'Сотрудник',
  deptAdmin: 'Админ отдела',
  superAdmin: 'Супер-админ',
}

export interface User {
  id: string
  name: string
  role: Role
  department: Department
}

export interface OrdaDocument {
  id: string
  title: string
  version: number
  mandatory: boolean
  /** ISO-дата срока ознакомления */
  dueDate?: string
  status: 'draft' | 'published'
  departments: Department[]
}

/** Подтверждение хранится с версией, датой и временем. */
export interface Acknowledgement {
  userId: string
  docId: string
  version: number
  at: string
}

export interface Reminder {
  id: string
  docId: string
  userId: string
  version: number
  sentAt: string
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  publishedAt: string
  department?: Department
  kind: 'news' | 'event'
}
