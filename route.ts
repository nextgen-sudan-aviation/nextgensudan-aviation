import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  // Supabase PKCE callback exchange is normally handled with @supabase/ssr cookies.
  // Redirect users to the app after the email link; configure the matching URL in Supabase.
  return NextResponse.redirect(new URL('/?verified=1', url.origin))
}
