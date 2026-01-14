import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import SEOHead from '@/components/SEOHead'
import { ClerkProvider } from '@clerk/nextjs'

// Check if Clerk is properly configured (not placeholder keys)
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const isClerkConfigured = clerkPubKey && 
  clerkPubKey.startsWith('pk_') && 
  !clerkPubKey.includes('your_publishable_key')

const clerkAppearance = {
  variables: {
    colorPrimary: '#f97316',
    colorBackground: '#0c0a09',
    colorInputBackground: '#1c1917',
    colorInputText: '#fafaf9',
  },
  elements: {
    formButtonPrimary: 'bg-orange-500 hover:bg-orange-600',
    card: 'bg-stone-900 border border-stone-800',
    headerTitle: 'text-white',
    headerSubtitle: 'text-stone-400',
    socialButtonsBlockButton: 'bg-stone-800 border-stone-700 text-white hover:bg-stone-700',
    formFieldInput: 'bg-stone-800 border-stone-700 text-white',
    footerActionLink: 'text-orange-400 hover:text-orange-300',
  }
}

export default function App({ Component, pageProps }: AppProps) {
  // Inner content that's shared
  const content = (
    <ThemeProvider>
      <SEOHead />
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-700',
          style: {
            background: '#fff',
            color: '#1a1a1a',
            border: '1px solid #e7e5e4',
            borderRadius: '0.75rem',
            padding: '16px',
            fontSize: '14px',
            fontFamily: 'Inter, ui-sans-serif, system-ui',
          },
          success: {
            iconTheme: {
              primary: '#f97316',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  )

  // Only wrap with ClerkProvider if properly configured
  if (isClerkConfigured) {
    return (
      <ClerkProvider appearance={clerkAppearance}>
        {content}
      </ClerkProvider>
    )
  }

  // Fallback: render without Clerk (legacy auth mode)
  return content
}