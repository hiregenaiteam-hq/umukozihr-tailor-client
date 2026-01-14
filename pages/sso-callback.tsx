import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import Head from 'next/head'

// Prevent static generation - Clerk needs runtime
export const runtime = 'nodejs'

export default function SSOCallbackPage() {
  return (
    <>
      <Head>
        <title>Authenticating... | UmukoziHR</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-stone-400">Completing sign in...</p>
        </div>
      </div>
      <AuthenticateWithRedirectCallback />
    </>
  )
}

// Prevent static generation
export function getServerSideProps() {
  return { props: {} }
}
