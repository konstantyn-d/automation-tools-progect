import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CheckIcon } from '../../components/icons.jsx'
import { Drawer, Empty, Fields, PageHead, SearchField, Status, Tabs, longDate, shortDate, timeAgo, useParam } from '../../components/admin/ui.jsx'
import { useAdmin } from '../../lib/adminStore.jsx'
import { PRODUCT_NAME, daysBetween, memberState } from '../../data/admin.js'
import { findCourse } from '../../data/courses.js'

export default function Members() {
  const { data, renewMember, setAccess, sendPasswordLink } = useAdmin()
  const { say } = useOutletContext()
  const [tab, setTab] = useParam('tab', 'all')
  const [q, setQ] = useParam('q')
  const [openId, setOpen] = useParam('open')
  const now = new Date()

  const state = (m) => memberState(m, now)
  const rows = useMemo(() => [...data.members].sort((a, b) => (b.start || '').localeCompare(a.start || '')), [data.members])
  const inTab = (m, t) => t === 'all' || (t === 'active' ? ['active', 'ending'].includes(state(m)) : state(m) === t)
  const query = q.trim().toLowerCase()
  const shown = rows.filter((m) => inTab(m, tab) && (!query || [m.name, m.email, m.id].some((v) => v.toLowerCase().includes(query))))
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'ending', label: 'Ends in 30 days' },
    { id: 'closed', label: 'Access closed' },
  ].map((t) => ({ ...t, count: rows.filter((m) => inTab(m, t.id)).length }))

  const expiredOpen = data.members.filter((m) => state(m) === 'expired-open').length
  const member = data.members.find((m) => m.id === openId)
  const plan = (m) => (m.plan ? PRODUCT_NAME[m.plan] : `${m.courses.length} single course${m.courses.length === 1 ? '' : 's'}`)

  return (
    <div className="ad-page">
      <PageHead eyebrow="Members" title="Who has access, and until when." soft="Access opens after payment and closes after the end date." />

      <div className={`ad-check ${expiredOpen ? 'ad-check--bad' : ''}`}>
        <span className="ad-check__mark"><CheckIcon size={2} /></span>
        <div>
          <b>Ended but still open: {expiredOpen}</b>
          <small>The nightly check closes access the day after the end date. The last check by hand found 123 of these.</small>
        </div>
      </div>

      <div className="ad-tools">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <SearchField value={q} onChange={setQ} placeholder="Name or e-mail…" />
      </div>

      {shown.length === 0 ? (
        <Empty title="No members here" text={query ? 'Nothing matches this search.' : ''} />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>Member</th><th>Access to</th><th>Since</th><th>Ends</th><th>Last seen</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.map((m, i) => (
                <tr key={m.id} onClick={() => setOpen(m.id)} className={openId === m.id ? 'is-open' : ''} style={{ '--i': Math.min(i, 12) }}>
                  <td className="c-main"><button className="ad-rowlink" onClick={() => setOpen(m.id)}><b>{m.name}</b></button><small>{m.email}</small></td>
                  <td className="c-id">{plan(m)}{m.seats > 1 && <small>{m.seats} seats</small>}</td>
                  <td className="ad-muted c-hide">{shortDate(m.start)}</td>
                  <td className="ad-muted c-meta">{m.end ? `ends ${shortDate(m.end)}` : 'never ends'}</td>
                  <td className="ad-muted c-hide">{m.lastSeen ? timeAgo(m.lastSeen) : 'not yet'}</td>
                  <td className="c-status"><Status value={state(m)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={!!member}
        onClose={() => setOpen('')}
        eyebrow={member && `Member · ${member.id}`}
        title={member?.name || ''}
        footer={
          member && (
            <>
              {member.plan && (
                <button className="key key--dark" onClick={() => { renewMember(member.id); say(`${member.name} renewed`) }}>
                  Renew one {member.plan === 'monthly' ? 'month' : 'year'}
                </button>
              )}
              {member.access === 'open' ? (
                <button className="key key--light" onClick={() => { setAccess(member.id, 'closed'); say(`Access closed for ${member.name}`) }}>Close access</button>
              ) : (
                <button className="key key--light" onClick={() => { setAccess(member.id, 'open'); say(`Access opened for ${member.name}`) }}>Open access</button>
              )}
              <button className="key key--light" onClick={() => { sendPasswordLink(member.id); say(`Password link sent to ${member.email}`) }}>Send password link</button>
            </>
          )
        }
      >
        {member && (
          <>
            {state(member) === 'ending' && (
              <div className="ad-issue ad-issue--warn">
                <b>Ends in {daysBetween(now, member.end)} days</b>
                <p>The renewal invoice goes out by itself 14 days before the end date.</p>
              </div>
            )}
            <Fields
              rows={[
                ['E-mail', member.email],
                ['Access to', plan(member)],
                member.seats > 1 && ['Seats', member.seats],
                ['Member since', longDate(member.start)],
                ['Ends', member.end ? longDate(member.end) : 'Never: single courses stay open'],
                ['Access', member.access === 'open' ? 'Open' : 'Closed'],
                ['Last seen', member.lastSeen ? timeAgo(member.lastSeen) : 'Not signed in yet'],
              ]}
            />
            {member.courses.length > 0 && (
              <>
                <h3 className="ad-sub">Courses bought one by one</h3>
                <ul className="ad-list">
                  {member.courses.map((s) => <li key={s}>{findCourse(s)?.title || s}</li>)}
                </ul>
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
