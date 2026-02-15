import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/invite',
    '/auth/callback',
    '/security',
    '/roadmap',
    '/about',
    '/privacy',
    '/terms',
    '/cookies',
  ]
  const isPublicRoute = publicRoutes.some(route =>
    route === '/' ? request.nextUrl.pathname === '/' : request.nextUrl.pathname.startsWith(route)
  )

  const pathname = request.nextUrl.pathname

  let userRole: 'broker' | 'vendor' | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    userRole = profile?.role === 'broker' || profile?.role === 'vendor' ? profile.role : null
  }

  // Redirect authenticated users from home to role dashboard
  if (pathname === '/' && user) {
    const url = request.nextUrl.clone()
    url.pathname = userRole === 'vendor' ? '/vendor' : '/broker'
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated users must have a valid role for protected app routes
  if (user && !userRole && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login/register pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = userRole === 'vendor' ? '/vendor' : '/broker'
    return NextResponse.redirect(url)
  }

  // Legacy dashboard routes redirect to role-specific homes
  if (user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = userRole === 'vendor' ? '/vendor' : '/broker'
    return NextResponse.redirect(url)
  }

  // Role route gating
  if (user && pathname.startsWith('/broker') && userRole === 'vendor') {
    const url = request.nextUrl.clone()
    url.pathname = '/vendor'
    return NextResponse.redirect(url)
  }

  if (user && pathname.startsWith('/vendor') && userRole === 'broker') {
    const url = request.nextUrl.clone()
    url.pathname = '/broker'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
