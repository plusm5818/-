import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { documents as seedDocs, initialAcks, users } from '@/data/mock'
import type { Acknowledgement, OrdaDocument, Reminder, User } from '@/types'

interface Store {
  user: User
  users: User[]
  switchUser: (id: string) => void
  /** Документы, доступные текущей роли (сотрудник не видит черновики и чужие отделы). */
  docs: OrdaDocument[]
  isAdmin: boolean
  ackedVersion: (userId: string, docId: string) => number | undefined
  hasAcked: (userId: string, doc: OrdaDocument) => boolean
  acknowledge: (docId: string) => void
  /** Кому адресован документ; админ отдела видит только людей своего отдела. */
  recipients: (doc: OrdaDocument) => User[]
  remindersFor: (docId: string, userId: string) => Reminder[]
  remind: (doc: OrdaDocument, userIds: string[]) => void
  acks: Acknowledgement[]
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState('u1')
  const [acks, setAcks] = useState<Acknowledgement[]>(initialAcks)
  const [reminders, setReminders] = useState<Reminder[]>([])

  const user = users.find((u) => u.id === userId)!
  const isAdmin = user.role !== 'employee'

  const docs = useMemo(
    () =>
      seedDocs.filter((d) => {
        if (user.role === 'superAdmin') return true
        if (!d.departments.includes(user.department)) return false
        return user.role === 'deptAdmin' || d.status === 'published'
      }),
    [user],
  )

  const ackedVersion = useCallback(
    (uid: string, docId: string) => {
      const versions = acks.filter((a) => a.userId === uid && a.docId === docId).map((a) => a.version)
      return versions.length ? Math.max(...versions) : undefined
    },
    [acks],
  )

  const value: Store = {
    user,
    users,
    switchUser: setUserId,
    docs,
    isAdmin,
    acks,
    ackedVersion,
    hasAcked: (uid, doc) => ackedVersion(uid, doc.id) === doc.version,
    // TODO: писать в Firestore acknowledgements под правилами по роли и отделу.
    acknowledge: (docId) => {
      const doc = seedDocs.find((d) => d.id === docId)
      if (!doc || doc.status !== 'published') return
      setAcks((all) => [...all, { userId: user.id, docId, version: doc.version, at: new Date().toISOString() }])
    },
    recipients: (doc) =>
      users.filter(
        (u) =>
          u.role === 'employee' &&
          doc.departments.includes(u.department) &&
          (user.role === 'superAdmin' || u.department === user.department),
      ),
    remindersFor: (docId, uid) => reminders.filter((r) => r.docId === docId && r.userId === uid),
    // TODO: коллекция reminders + push через Cloud Messaging.
    remind: (doc, userIds) => {
      if (!isAdmin || doc.status !== 'published') return
      const sentAt = new Date().toISOString()
      setReminders((all) => [
        ...all,
        ...userIds.map((uid) => ({
          id: crypto.randomUUID(),
          docId: doc.id,
          userId: uid,
          version: doc.version,
          sentAt,
        })),
      ])
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore вне StoreProvider')
  return s
}
