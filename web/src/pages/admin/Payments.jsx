import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Drawer, Empty, Fields, PageHead, Status, Tabs, euro, shortDate, useParam } from '../../components/admin/ui.jsx'
import { useAdmin } from '../../lib/adminStore.jsx'
import { bankFileCsv } from '../../data/admin.js'
import { parseBankCsv } from '../../lib/matching.js'

const RULES = [
  ['1', 'Structured reference', 'The +++…+++ reference belongs to an open invoice and the amount is equal. Paid too little, too much or twice: a person checks.'],
  ['2', 'Invoice number', 'The message holds an invoice number such as 2026-0141 and the amount is equal.'],
  ['3', 'Amount and name', 'No reference, but one open invoice has the same amount and the name fits. Only a suggestion: a person confirms.'],
  ['4', 'Nothing fits', 'The line waits for a person. Nothing is ever matched by guessing.'],
]

export default function Payments() {
  const { data, importLines, sampleBankLines, matchLine, assignLine, ignoreLine } = useAdmin()
  const { say } = useOutletContext()
  const [tab, setTab] = useParam('tab', 'todo')
  const [openId, setOpen] = useParam('open')
  const [running, setRunning] = useState(false)
  const [scanning, setScanning] = useState(null)
  const [pick, setPick] = useState('')
  const fileRef = useRef(null)
  const startCount = useRef(null)

  const fresh = data.bank.filter((l) => l.status === 'new')

  // Matching runs one line at a time, so you can follow what it decides.
  useEffect(() => {
    if (!running) return
    const next = data.bank.find((l) => l.status === 'new')
    if (!next) {
      setRunning(false)
      setScanning(null)
      const done = data.bank.filter((l) => startCount.current.has(l.id))
      const matched = done.filter((l) => l.status === 'matched').length
      say(`${matched} of ${done.length} lines matched by themselves, ${done.length - matched} for a person`)
      return
    }
    setScanning(next.id)
    const t = setTimeout(() => matchLine(next.id), 520)
    return () => clearTimeout(t)
  }, [running, data.bank])

  const run = () => {
    startCount.current = new Set(fresh.map((l) => l.id))
    setTab('all')
    setRunning(true)
  }

  const loadSample = () => {
    const lines = sampleBankLines()
    importLines(lines, 'sample bank file')
    setTab('todo')
    say(`${lines.length} lines loaded from today's bank file`)
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const lines = parseBankCsv(await file.text())
      importLines(lines, file.name)
      setTab('todo')
      say(`${lines.length} lines read from ${file.name}`)
    } catch (error) {
      say(`Could not read ${file.name}: ${error.message}`)
    }
  }

  const downloadSample = () => {
    const blob = new Blob([bankFileCsv(sampleBankLines())], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'bank-export-sample.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const groups = {
    todo: (l) => ['new', 'check', 'unmatched'].includes(l.status),
    matched: (l) => l.status === 'matched',
    ignored: (l) => l.status === 'ignored',
    all: () => true,
  }
  const tabs = [
    { id: 'todo', label: 'To do' },
    { id: 'matched', label: 'Matched' },
    { id: 'ignored', label: 'Set aside' },
    { id: 'all', label: 'All' },
  ].map((t) => ({ ...t, count: data.bank.filter(groups[t.id]).length }))
  const shown = data.bank.filter(groups[tab] || groups.all).slice(0, 80)

  const counts = data.bank.filter(groups.todo).length

  const line = data.bank.find((l) => l.id === openId)
  const openInvoices = data.invoices
    .filter((i) => i.status === 'open')
    .sort((a, b) => Math.abs(a.total - (line?.amount || 0)) - Math.abs(b.total - (line?.amount || 0)))
  const suggested = line?.invoice && data.invoices.find((i) => i.number === line.invoice)
  const who = (inv) => {
    const c = data.customers.find((x) => x.id === inv.customerId)
    return c.company || c.name
  }

  useEffect(() => setPick(''), [openId])

  const footer =
    line && ['check', 'unmatched', 'new'].includes(line.status) ? (
      <>
        {suggested && suggested.status === 'open' && (
          <button className="key key--dark" onClick={() => { assignLine(line.id, suggested.number); say(`Matched to ${suggested.number}, access given`); setOpen('') }}>
            Confirm {suggested.number}
          </button>
        )}
        <button className="key key--light" onClick={() => { ignoreLine(line.id, 'Not a customer payment'); say('Line set aside'); setOpen('') }}>
          Not a customer payment
        </button>
      </>
    ) : null

  return (
    <div className="ad-page">
      <PageHead eyebrow="Payments" title="Bank lines in, invoices paid." soft="Load the bank export and let matching do the rest.">
        <button className="key key--light key--sm" onClick={() => fileRef.current?.click()}>Import CSV</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onFile} />
        <button className="key key--light key--sm" onClick={loadSample}>Load today's bank file</button>
        <button className="key key--dark key--sm" disabled={!fresh.length || running} onClick={run}>
          {running ? 'Matching…' : `Run matching${fresh.length ? ` (${fresh.length})` : ''}`}
        </button>
      </PageHead>

      {counts === 0 && !running && (
        <div className="ad-hint">
          <b>Nothing to match right now.</b> Press <em>Load today's bank file</em> to bring in a sample export with a few tricky lines, or{' '}
          <button className="ad-link" onClick={downloadSample}>download the sample CSV</button> and import it yourself.
        </div>
      )}

      <div className="ad-tools">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
        <details className="ad-rules">
          <summary>How matching decides</summary>
          <ol>
            {RULES.map(([n, t, d]) => (
              <li key={n}><b>{t}</b>{d}</li>
            ))}
          </ol>
        </details>
      </div>

      {shown.length === 0 ? (
        <Empty title={tab === 'todo' ? 'Nothing to do' : 'No lines here'} text={tab === 'todo' ? 'Every bank line is matched or set aside.' : ''} />
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table ad-table--bank">
            <thead>
              <tr><th>Date</th><th>From</th><th>Message</th><th className="num">Amount</th><th>Result</th></tr>
            </thead>
            <tbody>
              {shown.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => setOpen(l.id)}
                  className={`${openId === l.id ? 'is-open' : ''} ${scanning === l.id ? 'is-scanning' : ''} ${l.status === 'new' ? 'is-new' : ''}`}
                  style={{ '--i': Math.min(i, 12) }}
                >
                  <td className="ad-muted c-meta">{shortDate(l.date)}</td>
                  <td className="c-main"><b>{l.name}</b><small className="mono">{l.iban}</small></td>
                  <td className="mono ad-msg c-hide">{l.message || '—'}</td>
                  <td className="num c-amount">{euro(l.amount)}</td>
                  <td className="c-status">
                    <span className="ad-result">
                      {scanning === l.id ? <i className="chip chip--info">Checking…</i> : <Status value={l.status} />}
                      {l.invoice && <span className="mono">{l.invoice}</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={!!line} onClose={() => setOpen('')} eyebrow={line && `Bank line · ${shortDate(line.date)}`} title={line ? `${euro(line.amount)} from ${line.name}` : ''} footer={footer}>
        {line && (
          <>
            {line.note && (
              <div className={`ad-issue ad-issue--${line.status === 'matched' ? 'ok' : line.status === 'unmatched' ? 'error' : line.status === 'ignored' ? 'plain' : 'warn'}`}>
                <b>{line.status === 'matched' ? `Matched${line.by === 'auto' ? ' by itself' : ` by ${line.by}`}` : line.status === 'ignored' ? 'Set aside' : line.rule === 4 ? 'No match' : 'To check'}{line.rule ? ` · rule ${line.rule}` : ''}</b>
                <p>{line.note}</p>
              </div>
            )}
            <Fields
              rows={[
                ['Amount', <b key="a">{euro(line.amount)}</b>],
                ['Name', line.name],
                ['IBAN', <span key="i" className="mono-num">{line.iban}</span>],
                ['Message', <span key="m" className="mono-num">{line.message || '—'}</span>],
                suggested && ['Invoice', `${suggested.number} · ${who(suggested)} · ${euro(suggested.total)}`],
              ]}
            />
            {['check', 'unmatched', 'new'].includes(line.status) && (
              <>
                <h3 className="ad-sub">Match by hand</h3>
                <p className="ad-note">Open invoices, closest amount first.</p>
                <ul className="ad-pick">
                  {openInvoices.slice(0, 6).map((inv) => (
                    <li key={inv.number}>
                      <label className={pick === inv.number ? 'is-on' : ''}>
                        <input type="radio" name="pick" checked={pick === inv.number} onChange={() => setPick(inv.number)} />
                        <span className="mono">{inv.number}</span>
                        <span>{who(inv)}</span>
                        <span className={`num ${inv.total === line.amount ? 'is-same' : ''}`}>{euro(inv.total)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <button className="key key--light key--sm" disabled={!pick} onClick={() => { assignLine(line.id, pick); say(`Matched to ${pick} by hand`); setOpen('') }}>
                  Match to {pick || '…'}
                </button>
              </>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
