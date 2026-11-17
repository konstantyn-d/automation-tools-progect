import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEMO_MEMBER } from '../data/member.js'

// Who is signed in. For now this lives in the browser only (localStorage):
// there is no server yet. Later signIn() becomes a real request and the rest stays the same.

const KEY = 'loopcasts.member'
const SessionContext = createContext(null)

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch {
    return null // private window or blocked storage: start signed out
  }
}

function save(member) {
  try {
    if (member) localStorage.setItem(KEY, JSON.stringify(member))
    else localStorage.removeItem(KEY)
  } catch {
    // the session then only lasts until the page is closed, which is fine
  }
}

export function SessionProvider({ children }) {
  const [member, setMember] = useState(load)

  const update = useCallback((next) => {
    setMember((current) => {
      const value = typeof next === 'function' ? next(current) : next
      save(value)
      return value
    })
  }, [])

  const value = useMemo(
    () => ({
      member,
      // Sign in as the demo member, optionally with another name, e-mail or plan.
      signIn: (overrides = {}) => update({ ...DEMO_MEMBER, ...overrides }),
      signOut: () => update(null),
      markWatched: (slug, nr) =>
        update((m) => {
          if (!m) return m
          const watched = m.progress[slug] || []
          if (watched.includes(nr)) return m
          return { ...m, progress: { ...m.progress, [slug]: [...watched, nr] } }
        }),
    }),
    [member, update],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}

// The rule that decides whether a lesson plays or shows the lock.
//  - the first lesson of every course is free
//  - a subscription or team licence opens everything until its end date
//  - a single course opens that one course for good
export function canWatch(member, course, lesson) {
  if (lesson.free) return true
  if (!member) return false
  if (member.plan === 'single') return member.course === course.slug
  return new Date(member.endDate) >= new Date(new Date().toDateString())
}

export function hasCourse(member, course) {
  return canWatch(member, course, { free: false })
}
