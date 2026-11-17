import { useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { WarnIcon } from '../../components/icons.jsx'
import { Empty, PageHead, Status, Tabs, longDate, timeAgo, useParam } from '../../components/admin/ui.jsx'
import { useAdmin } from '../../lib/adminStore.jsx'

const LANG = { en: 'English', nl: 'Dutch', fr: 'French' }
const PEOPLE = ['Office (An)', 'Finance (Koen)', 'Teacher']

export default function Support() {
  const { data, editDraft, sendReply, assignTicket, flagTicket } = useAdmin()
  const { say } = useOutletContext()
  const [tab, setTab] = useParam('tab', 'waiting')
  const [openId, setOpen] = useParam('open')

  const rows = useMemo(() => [...data.tickets].sort((a, b) => b.received.localeCompare(a.received)), [data.tickets])
  const groups = {
    waiting: (t) => t.status === 'waiting',
    assigned: (t) => t.status === 'assigned',
    done: (t) => ['sent', 'phishing'].includes(t.status),
    all: () => true,
  }
  const tabs = [
    { id: 'waiting', label: 'Waiting' },
    { id: 'assigned', label: 'With a person' },
    { id: 'done', label: 'Done' },
    { id: 'all', label: 'All' },
  ].map((t) => ({ ...t, count: rows.filter(groups[t.id]).length }))
  const shown = rows.filter(groups[tab] || groups.all)
  const ticket = data.tickets.find((t) => t.id === openId)

  // On a wide screen the first mail opens by itself.
  useEffect(() => {
    if (!openId && shown[0] && window.matchMedia('(min-width: 980px)').matches) setOpen(shown[0].id)
  }, [openId, tab])

  const nextAfter = (id) => {
    const rest = shown.filter((t) => t.id !== id)
    return rest[0]?.id || ''
  }

  return (
    <div className="ad-page">
      <PageHead eyebrow="Support" title="Every mail sorted, every answer drafted." soft="Nothing goes out before a person approves it." />
      <div className="ad-tools">
        <Tabs tabs={tabs} value={tab} onChange={(v) => { setTab(v); setOpen('') }} />
      </div>

      <div className={`inbox ${ticket ? 'has-open' : ''}`}>
        <ul className="inbox__list">
          {shown.length === 0 && <li><Empty title="Inbox zero" text="No mails in this group." /></li>}
          {shown.map((t, i) => (
            <li key={t.id} style={{ '--i': Math.min(i, 12) }}>
              <button className={`inbox__row ${openId === t.id ? 'is-on' : ''}`} onClick={() => setOpen(t.id)}>
                <span className="inbox__top">
                  <b>{t.name}</b>
                  <time>{timeAgo(t.received)}</time>
                </span>
                <span className="inbox__subject">{t.subject}</span>
                <span className="inbox__tags">
                  {t.risk ? <i className="chip chip--error">{t.risk}</i> : <i className="chip">{t.category}</i>}
                  {t.needsPerson && t.status === 'waiting' && <i className="chip chip--warn">Needs a person</i>}
                  {t.status !== 'waiting' && <Status value={t.status} label={t.status === 'assigned' ? t.assignee : undefined} />}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <section className="inbox__read" aria-live="polite">
          {!ticket ? (
            <Empty title="Pick a mail" text="The draft answer appears next to it." />
          ) : (
            <article key={ticket.id} className="mail">
              <button className="mail__back back" onClick={() => setOpen('')}>← All mails</button>
              <header className="mail__head">
                <h2>{ticket.subject}</h2>
                <p>
                  <b>{ticket.name}</b> &lt;{ticket.email}&gt; · {longDate(ticket.received)}
                </p>
              </header>

              <div className="mail__facts">
                <span className="chip">{ticket.category}</span>
                <span className="chip">{LANG[ticket.lang]}</span>
                <span className="mail__conf">
                  <span className="mail__meter"><span style={{ width: `${ticket.confidence * 100}%` }} /></span>
                  {Math.round(ticket.confidence * 100)}% sure
                </span>
              </div>

              {ticket.risk && (
                <div className="ad-issue ad-issue--error">
                  <b><WarnIcon size={2} /> {ticket.risk}</b>
                  <p>Do not click links, pay, or send account details. {ticket.risk === 'Looks like phishing' ? 'Mark it as phishing to block the sender.' : 'Only a person answers this one.'}</p>
                </div>
              )}

              <blockquote className="mail__body">{ticket.body}</blockquote>

              <h3 className="ad-sub">What we found</h3>
              <ul className="mail__found">
                {ticket.facts.map((f) => <li key={f}>{f}</li>)}
              </ul>

              {ticket.draft !== '' && (
                <>
                  <h3 className="ad-sub">
                    {ticket.status === 'sent' ? 'Answer that was sent' : `Draft answer · ${LANG[ticket.lang]}`}
                  </h3>
                  <textarea
                    className="mail__draft"
                    value={ticket.draft}
                    readOnly={ticket.status === 'sent'}
                    onChange={(e) => editDraft(ticket.id, e.target.value)}
                    rows={8}
                  />
                </>
              )}

              {ticket.status === 'waiting' && (
                <div className="mail__actions">
                  {ticket.risk === 'Looks like phishing' ? (
                    <button className="key key--dark" onClick={() => { flagTicket(ticket.id); say('Marked as phishing, sender blocked'); setOpen(nextAfter(ticket.id)) }}>
                      Mark as phishing
                    </button>
                  ) : (
                    <button className="key key--dark" disabled={!ticket.draft.trim()} onClick={() => { sendReply(ticket.id); say(`Answer sent to ${ticket.name}`); setOpen(nextAfter(ticket.id)) }}>
                      Approve and send
                    </button>
                  )}
                  <label className="mail__assign">
                    <span className="sr-only">Give to a person</span>
                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return
                        assignTicket(ticket.id, e.target.value)
                        say(`Given to ${e.target.value}`)
                        setOpen(nextAfter(ticket.id))
                      }}
                    >
                      <option value="">Give to a person…</option>
                      {PEOPLE.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </label>
                </div>
              )}
              {ticket.status === 'assigned' && <p className="ad-note">With {ticket.assignee}. They answer from their own mailbox.</p>}
            </article>
          )}
        </section>
      </div>
    </div>
  )
}
