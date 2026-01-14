import { SignIn } from '@clerk/nextjs'
import Head from 'next/head'
import Link from 'next/link'
import { HeroLogo } from '@/components/Logo'

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
            <Link href="/" className="inline-block">
              <HeroLogo />
            </Link>
          </div>
          
          {/* Clerk Sign In */}
          <SignIn 
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/app"
            appearance={{
              layout: {
                socialButtonsPlacement: 'top',
                showOptionalFields: false,
                logoPlacement: 'none',
              },
              elements: {
                rootBox: 'w-full',
                card: 'bg-stone-900/95 backdrop-blur-xl shadow-2xl border border-white/10 rounded-3xl p-6 pt-8',
                headerTitle: 'text-white text-xl font-bold',
                headerSubtitle: 'text-stone-400',
                socialButtons: 'gap-3',
                socialButtonsBlockButton: 'bg-stone-800 border border-stone-600 text-white hover:bg-stone-700 hover:border-stone-500 transition-all rounded-xl py-3',
                socialButtonsBlockButtonText: 'font-medium',
                socialButtonsProviderIcon: 'w-5 h-5',
                dividerLine: 'bg-stone-700',
                dividerText: 'text-stone-500 bg-stone-900',
                formFieldLabel: 'text-stone-300 font-medium',
                formFieldInput: 'bg-stone-800 border-stone-600 text-white placeholder-stone-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20',
                formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 rounded-xl py-3',
                footerActionLink: 'text-orange-400 hover:text-orange-300',
                footerActionText: 'text-stone-400',
                identityPreviewEditButton: 'text-orange-400',
                formFieldInputShowPasswordButton: 'text-stone-400 hover:text-white',
                logoBox: 'hidden',
                logoImage: 'hidden',
                formFieldRow: 'mb-4',
                form: 'gap-4',
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
