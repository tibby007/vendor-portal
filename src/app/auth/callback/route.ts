import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Whitelist of allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECT_PATHS = [
  '/dashboard',
  '/onboarding',
  '/profile',
  '/settings',
]

function isValidRedirectPath(path: string): boolean {
  // Must start with / and not contain protocol or double slashes
  if (!path.startsWith('/') || path.startsWith('//') || path.includes(':')) {
    return false
  }
  // Check against whitelist
  return ALLOWED_REDIRECT_PATHS.some(allowed => path.startsWith(allowed))
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate redirect path to prevent open redirect vulnerability
  const redirectPath = isValidRedirectPath(next) ? next : '/dashboard'

  const supabase = await createClient()

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Handle email confirmation (token_hash flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'signup' | 'recovery' | 'email_change',
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
