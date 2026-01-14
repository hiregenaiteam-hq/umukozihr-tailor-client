import { SignIn } from '@clerk/nextjs'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Prevent static generation - Clerk needs runtime
export const runtime = 'nodejs'
export const dynamic_config = 'force-dynamic'

function SignInPage() {
  return (
    <>
      <Head>
        <title>Sign In | UmukoziHR Resume Tailor</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-xl font-bold text-white">UmukoziHR</span>
            </a>
          </div>
          
          {/* Clerk Sign In */}
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            afterSignInUrl="/app"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'w-full shadow-xl',
              }
            }}
          />
        </div>
      </div>
    </>
  )
}

// Prevent static generation
export function getServerSideProps() {
  return { props: {} }
}

export default SignInPage
