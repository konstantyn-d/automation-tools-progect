import { isValidReference } from './invoice.js'

// Payment matching: which invoice does a bank line belong to?
// The rules, in order. The first rule that fits decides.
//
//  1. The message holds a valid structured reference of one of our invoices.
//     Amount equal to the invoice      -> matched
//     Invoice was already paid         -> to check (paid twice?)
//     Amount different                 -> to check (paid too little or too much)
//  2. The message holds an invoice number such as 2026-0141, and the amount is equal -> matched
//  3. No reference, but exactly one open invoice has the same amount and a customer whose
//     name appears in the bank line                                      -> to check, with a suggestion
//  4. Nothing fits                                                        -> not matched, a person looks
//
// "To check" and "not matched" never change anything by themselves: a person decides.

const cents = (amount) => Math.round(Number(amount) * 100)
const digitsOf = (text) => String(text || '').replace(/\D/g, '')
const words = (text) =>
  String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !['bvba', 'sprl', 'gmbh', 'nv', 'bv', 'the'].includes(w))

export function matchPayment(line, invoices, customers) {
  // rule 1: structured reference
  const refMatch = String(line.message || '').match(/\+{0,3}\s*(\d{3})\s*\/?\s*(\d{4})\s*\/?\s*(\d{5})\s*\+{0,3}/)
  if (refMatch && isValidReference(refMatch[0])) {
    const digits = digitsOf(refMatch[0])
    const invoice = invoices.find((inv) => digitsOf(inv.reference) === digits)
    if (invoice) {
      if (invoice.status === 'paid') {
        return { status: 'check', invoice: invoice.number, rule: 1, note: `Invoice ${invoice.number} was already paid. Paid twice?` }
      }
      if (cents(line.amount) !== cents(invoice.total)) {
        const diff = (cents(line.amount) - cents(invoice.total)) / 100
        return {
          status: 'check',
          invoice: invoice.number,
          rule: 1,
          note: `Reference fits invoice ${invoice.number}, but the amount is ${diff < 0 ? 'short' : 'over'} by €${Math.abs(diff).toFixed(2)}.`,
        }
      }
      return { status: 'matched', invoice: invoice.number, rule: 1, note: 'Structured reference and amount match.' }
    }
  }

  // rule 2: invoice number written in the message
  const numberMatch = String(line.message || '').match(/20\d{2}\s*[-/]\s*\d{4}/)
  if (numberMatch) {
    const number = numberMatch[0].replace(/\s/g, '').replace('/', '-')
    const invoice = invoices.find((inv) => inv.number === number && inv.status !== 'paid')
    if (invoice && cents(line.amount) === cents(invoice.total)) {
      return { status: 'matched', invoice: invoice.number, rule: 2, note: 'Invoice number in the message and amount match.' }
    }
  }

  // rule 3: same amount and a name that fits
  const lineWords = new Set(words(`${line.name} ${line.message}`))
  const candidates = invoices.filter((inv) => {
    if (inv.status === 'paid' || cents(inv.total) !== cents(line.amount)) return false
    const customer = customers.find((c) => c.id === inv.customerId)
    return words(`${customer?.name} ${customer?.company || ''}`).some((w) => lineWords.has(w))
  })
  if (candidates.length === 1) {
    return {
      status: 'check',
      invoice: candidates[0].number,
      rule: 3,
      note: `No reference. Amount and name fit invoice ${candidates[0].number}.`,
    }
  }

  return { status: 'unmatched', invoice: null, rule: 4, note: 'No reference, and no open invoice fits this amount and name.' }
}

// Reads a bank export (CSV). Accepts ; or , and finds the columns by their header names.
export function parseBankCsv(text) {
  const rows = String(text)
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((r) => r.trim())
  if (rows.length < 2) throw new Error('The file has no lines below the header.')
  const sep = (rows[0].match(/;/g) || []).length >= (rows[0].match(/,/g) || []).length ? ';' : ','
  const split = (row) => row.split(sep).map((cell) => cell.trim().replace(/^"|"$/g, ''))
  const header = split(rows[0]).map((h) => h.toLowerCase())
  const find = (...names) => header.findIndex((h) => names.some((n) => h.includes(n)))
  const col = {
    date: find('date', 'datum'),
    amount: find('amount', 'bedrag', 'montant'),
    name: find('name', 'naam', 'counterparty', 'tegenpartij'),
    iban: find('iban', 'account', 'rekening'),
    message: find('message', 'mededeling', 'description', 'omschrijving', 'communication'),
  }
  if (col.amount < 0 || col.date < 0) throw new Error('Could not find a date and an amount column. Expected headers like date;amount;name;iban;message.')
  return rows.slice(1).map((row, i) => {
    const cells = split(row)
    const amount = Number(String(cells[col.amount]).replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'))
    return {
      date: cells[col.date],
      amount,
      name: col.name >= 0 ? cells[col.name] : '',
      iban: col.iban >= 0 ? cells[col.iban] : '',
      message: col.message >= 0 ? cells[col.message] : '',
      row: i + 2,
    }
  }).filter((l) => Number.isFinite(l.amount) && l.amount > 0)
}
