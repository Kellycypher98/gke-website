export type OrderInput = Record<string, any>

export function normalizeOrderForDb(input: OrderInput) {
  const amountVal = (() => {
    const a = input.amount ?? input.total_amount ?? input.price ?? null
    if (typeof a === 'string') {
      const parsed = parseFloat(a)
      return isNaN(parsed) ? null : parsed
    }
    return a
  })()

  return {
    // Map input variants to actual database column names (mixed camelCase/snake_case)
    customerEmail: input.customerEmail ?? input.customer_email ?? input.email ?? null,
    customerName: input.customerName ?? input.customer_name ?? input.name ?? null,
    stripeSessionId: input.stripeSessionId ?? input.stripe_session_id ?? input.sessionId ?? null,
    paymentStatus: input.paymentStatus ?? input.payment_status ?? null,
    ticketType: input.ticketType ?? input.ticket_type ?? null,
    quantity: input.quantity ?? input.qty ?? 1,
    amount: amountVal ?? 0, // Using 'amount' instead of 'totalAmount' based on schema
    eventId: input.eventId ?? input.event_id ?? input.event ?? null,
    paymentLinkId: input.paymentLinkId ?? input.payment_link_id ?? null,
    metadata: input.metadata ?? input.meta ?? null,
    status: input.status ?? null,
    confirmation_sent: input.confirmationSent ?? input.confirmation_sent ?? false,
    createdAt: input.createdAt ?? input.created_at ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? input.updated_at ?? new Date().toISOString(),
    // Do not include the raw payload by default — inserting unknown columns
    // into PostgREST/Supabase will cause PGRST204 errors. If you need the
    // original input for debugging, call normalizeOrderForDbDebug which
    // returns the same object with a `_raw` property.
  }
}

export function normalizeOrderForDbDebug(input: OrderInput) {
  return {
    ...normalizeOrderForDb(input),
    _raw: input,
  }
}

// Remove keys that should never be written to the database (like _raw)
export function sanitizeDbPayload(obj: Record<string, any>) {
  const copy: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    // strip internal keys starting with underscore
    if (key.startsWith('_')) continue
    copy[key] = obj[key]
  }
  return copy
}

// Convert known keys between snake_case and camelCase for retrying DB writes
const keyPairs: Array<[string, string]> = [
  ['createdAt', 'created_at'],
  ['updatedAt', 'updated_at'],
  ['confirmationSent', 'confirmation_sent'],
  ['customerEmail', 'customer_email'],
  ['customerName', 'customer_name'],
  ['stripeSessionId', 'stripe_session_id'],
  ['paymentStatus', 'payment_status'],
  ['ticketType', 'ticket_type'],
  ['paymentLinkId', 'payment_link_id'],
  ['amount', 'total_amount'], // Map amount to total_amount for fallback
  ['eventId', 'event_id'],
]

function swapCaseKeys(obj: Record<string, any>) {
  const out: Record<string, any> = {}
  const keyMap: Record<string, string> = {}
  for (const [camel, snake] of keyPairs) {
    keyMap[camel] = snake
    keyMap[snake] = camel
  }

  for (const key of Object.keys(obj)) {
    if (key in keyMap) {
      out[keyMap[key]] = obj[key]
    } else {
      out[key] = obj[key]
    }
  }
  return out
}

// Attempt DB insert; if PostgREST complains about unknown columns (PGRST204),
// retry with swapped key casing once.
export async function performSafeInsert(supabase: any, table: string, payload: Record<string, any>) {
  const sanitized = sanitizeDbPayload(payload)
  let res = await (supabase as any).from(table).insert(sanitized).select().single()
  if (!res.error) return res

  if (res.error && res.error.code === 'PGRST204') {
    const alt = swapCaseKeys(sanitized)
    res = await (supabase as any).from(table).insert(alt).select().single()
    return res
  }

  return res
}

// Attempt DB update with same fallback logic
export async function performSafeUpdate(supabase: any, table: string, payload: Record<string, any>, eqKey: string, eqVal: any) {
  const sanitized = sanitizeDbPayload(payload)
  let res = await (supabase as any).from(table).update(sanitized).eq(eqKey, eqVal).select().single()
  if (!res.error) return res

  if (res.error && res.error.code === 'PGRST204') {
    const alt = swapCaseKeys(sanitized)
    res = await (supabase as any).from(table).update(alt).eq(eqKey, eqVal).select().single()
    return res
  }

  return res
}
