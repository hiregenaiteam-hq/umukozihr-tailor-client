import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, Mail, ArrowRight } from "lucide-react";

import { HeaderLogo } from "../../components/Logo";
import { auth } from "../../lib/api";

type VerificationState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!router.isReady) return;

    const token = typeof router.query.token === "string" ? router.query.token : "";
    if (!token) {
      setState("error");
      setMessage("This verification link is incomplete.");
      return;
    }

    auth
      .verifyEmail(token)
      .then((response) => {
        setState("success");
        setMessage(response.data?.message || "Email verified successfully.");
      })
      .catch((error) => {
        setState("error");
        setMessage(
          error?.response?.data?.detail || "We could not verify your email. Please request a new link."
        );
      });
  }, [router.isReady, router.query.token]);

  return (
    <>
      <Head>
        <title>Verify Email | UmukoziHR Tailor</title>
        <meta name="description" content="Verify your UmukoziHR Tailor account" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4">
          <div className="mb-10">
            <HeaderLogo size="lg" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-stone-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center justify-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-3xl ${
                  state === "success"
                    ? "bg-green-500/15"
                    : state === "error"
                    ? "bg-red-500/15"
                    : "bg-orange-500/15"
                }`}
              >
                {state === "loading" ? (
                  <Loader2 className="h-10 w-10 animate-spin text-orange-300" />
                ) : state === "success" ? (
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                ) : (
                  <AlertTriangle className="h-10 w-10 text-red-400" />
                )}
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold">
                {state === "loading"
                  ? "Verifying your email"
                  : state === "success"
                  ? "Email verified"
                  : "Verification failed"}
              </h1>
              <p className="mt-4 text-base leading-7 text-stone-300">{message}</p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/8 bg-stone-950/60 p-4 text-sm text-stone-400">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-300" />
                <p>
                  Verified accounts can use their Free, Launch, or Bounty generation allowance. If
                  this link expired, sign in and resend the verification email from Settings.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Go to App
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/settings"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 px-5 py-3 font-medium text-stone-300 transition hover:border-white/20 hover:text-white"
              >
                Open Settings
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
