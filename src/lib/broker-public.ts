interface BrokerPublicRow {
  company_name?: string | null
  display_name?: string | null
  support_email?: string | null
  support_phone?: string | null
  logo_url?: string | null
}

const GENERIC_BROKER_NAMES = new Set(['broker', 'your broker'])

const normalize = (value?: string | null) => (value || '').trim()

export function resolveBrokerName(broker: BrokerPublicRow | null | undefined): string {
  const companyName = normalize(broker?.company_name)
  const displayName = normalize(broker?.display_name)
  const normalizedCompany = companyName.toLowerCase()

  if (companyName && !GENERIC_BROKER_NAMES.has(normalizedCompany)) {
    return companyName
  }

  if (displayName) {
    return displayName
  }

  return companyName || 'Broker'
}

export function resolveBrokerSupportContact(
  broker: BrokerPublicRow | null | undefined,
  fallback: string
): string {
  const supportPhone = normalize(broker?.support_phone)
  const supportEmail = normalize(broker?.support_email)

  if (supportPhone) {
    return supportPhone
  }

  if (supportEmail) {
    return supportEmail
  }

  return fallback
}
