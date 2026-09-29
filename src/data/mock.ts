import type { Acknowledgement, NewsItem, OrdaDocument, User } from '@/types'

// Временные данные до подключения Firestore.
export const users: User[] = [
  { id: 'u1', name: 'Анна Сергеева', role: 'employee', department: 'Бухгалтерия' },
  { id: 'u2', name: 'Игорь Петров', role: 'employee', department: 'Бухгалтерия' },
  { id: 'u3', name: 'Мария Ким', role: 'employee', department: 'Бухгалтерия' },
  { id: 'u4', name: 'Дмитрий Орлов', role: 'employee', department: 'IT-отдел' },
  { id: 'u5', name: 'Светлана Ахметова', role: 'employee', department: 'IT-отдел' },
  { id: 'u6', name: 'Олег Назаров', role: 'employee', department: 'Отдел кадров' },
  { id: 'u7', name: 'Елена Волкова', role: 'deptAdmin', department: 'Бухгалтерия' },
  { id: 'u8', name: 'Тимур Байжанов', role: 'deptAdmin', department: 'IT-отдел' },
  { id: 'u9', name: 'Наталья Лебедева', role: 'superAdmin', department: 'Отдел кадров' },
]

export const documents: OrdaDocument[] = [
  {
    id: 'd1',
    title: 'Политика информационной безопасности',
    version: 3,
    mandatory: true,
    dueDate: '2026-09-25',
    status: 'published',
    departments: ['Бухгалтерия', 'IT-отдел'],
  },
  {
    id: 'd2',
    title: 'Регламент отпусков на 2027 год',
    version: 1,
    mandatory: true,
    dueDate: '2026-10-05',
    status: 'published',
    departments: ['Бухгалтерия', 'Отдел кадров'],
  },
  {
    id: 'd3',
    title: 'Приказ о порядке закрытия квартала',
    version: 1,
    mandatory: true,
    dueDate: '2026-10-20',
    status: 'published',
    departments: ['Бухгалтерия'],
  },
  {
    id: 'd4',
    title: 'Памятка по командировкам',
    version: 2,
    mandatory: false,
    status: 'published',
    departments: ['Бухгалтерия'],
  },
  {
    id: 'd5',
    title: 'Положение о премировании (черновик)',
    version: 1,
    mandatory: true,
    dueDate: '2026-11-01',
    status: 'draft',
    departments: ['Бухгалтерия'],
  },
]

export const initialAcks: Acknowledgement[] = [
  { userId: 'u1', docId: 'd1', version: 2, at: '2026-09-10T09:12:00' },
  { userId: 'u4', docId: 'd1', version: 3, at: '2026-09-22T14:30:00' },
  { userId: 'u2', docId: 'd1', version: 3, at: '2026-09-23T10:05:00' },
  { userId: 'u6', docId: 'd2', version: 1, at: '2026-09-28T16:40:00' },
  { userId: 'u1', docId: 'd4', version: 2, at: '2026-09-15T11:00:00' },
]

export const news: NewsItem[] = [
  {
    id: 'n1',
    kind: 'news',
    title: 'Новый офис в Алматы открыт',
    summary: 'С 1 октября часть команды переезжает в обновлённое пространство.',
    publishedAt: '2026-09-28',
  },
  {
    id: 'n2',
    kind: 'event',
    title: 'Тренинг по финансовой отчётности',
    summary: '3 октября, 11:00, переговорная 2.',
    publishedAt: '2026-09-27',
    department: 'Бухгалтерия',
  },
]
