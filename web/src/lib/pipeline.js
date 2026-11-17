// The order chain as data. The landing page plays it with fake timers.
// Later the same step ids will come from n8n as real events (webhook -> site),
// so the visual part does not have to change.

export const STEPS = [
  { id: 'order', label: 'Order', detail: 'Form sends a webhook', ms: 900 },
  { id: 'validate', label: 'Validate', detail: 'Fields and VAT number', ms: 1200 },
  { id: 'invoice', label: 'Invoice', detail: 'Number, PDF, e-mail', ms: 1400 },
  { id: 'payment', label: 'Payment', detail: 'Matched to the bank', ms: 1500 },
  { id: 'access', label: 'Access', detail: 'Account and welcome mail', ms: 1000 },
]

const LOG = {
  order: ['webhook received · yearly subscription', 'customer: Hanne W. · BE'],
  validate: ['required fields complete', 'VAT rule: Belgium, 21%'],
  invoice: ['invoice 2026-0143 created', 'PDF sent to customer'],
  payment: ['bank line +++143/2026/00187+++', 'amount € 180.29 matches'],
  access: ['account created, password link sent', 'done, no person involved'],
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      reject(new DOMException('aborted', 'AbortError'))
    })
  })
}

// Plays one run. `emit` receives events of the shape:
//   { type: 'step', id, status: 'running' | 'done' | 'error' | 'retry' }
//   { type: 'log', text, level }
//   { type: 'finished' }
// With fail = true the invoice e-mail fails once, is retried and then succeeds:
// "nothing fails silently".
export async function playRun({ emit, fail = false, speed = 1, signal }) {
  try {
    for (const step of STEPS) {
      emit({ type: 'step', id: step.id, status: 'running' })
      await wait((step.ms * 0.55) / speed, signal)
      emit({ type: 'log', text: LOG[step.id][0], level: 'info' })

      if (fail && step.id === 'invoice') {
        await wait(700 / speed, signal)
        emit({ type: 'step', id: step.id, status: 'error' })
        emit({ type: 'log', text: 'mail server did not answer (timeout)', level: 'error' })
        await wait(1100 / speed, signal)
        emit({ type: 'log', text: 'error workflow: team notified, retry 1 of 3', level: 'warn' })
        emit({ type: 'step', id: step.id, status: 'retry' })
        await wait(1300 / speed, signal)
      }

      await wait((step.ms * 0.45) / speed, signal)
      emit({ type: 'log', text: LOG[step.id][1], level: step.id === 'access' ? 'ok' : 'info' })
      emit({ type: 'step', id: step.id, status: 'done' })
      await wait(260 / speed, signal)
    }
    emit({ type: 'finished' })
  } catch (error) {
    if (error.name !== 'AbortError') throw error
  }
}
