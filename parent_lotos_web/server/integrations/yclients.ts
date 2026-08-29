const apiBase = 'https://api.yclients.com/api/v1'

function headers() {
  const partner = process.env.YCLIENTS_PARTNER_TOKEN
  const user = process.env.YCLIENTS_USER_TOKEN
  if (!partner || !user) throw new Error('YCLIENTS credentials are not configured')
  return {
    Authorization: `Bearer ${partner}, User ${user}`,
    Accept: 'application/vnd.yclients.v2+json',
    'Content-Type': 'application/json',
  }
}

export async function yclientsRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
  })
  if (!response.ok) throw new Error(`YCLIENTS request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export async function findYclientsClients(phone: string) {
  const companyId = process.env.YCLIENTS_COMPANY_ID
  if (!companyId) throw new Error('YCLIENTS_COMPANY_ID is not configured')
  return yclientsRequest<{ success: boolean; data: unknown[] }>(
    `/book_records/${companyId}?phone=${encodeURIComponent(phone)}`,
  )
}
