import { createBrowserClient } from '@supabase/ssr';

export function createAuthClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
