import { useAuth } from "@/_core/hooks/useAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";

type AuthMode = "signin" | "signup";

function safeInternalRedirect(value: string | null): string {
  if (!value) return "/";
  try {
    const destination = new URL(value, window.location.origin);
    if (destination.origin !== window.location.origin || destination.pathname === "/login") {
      return "/";
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return safeInternalRedirect(params.get("redirectTo"));
  }, []);
  const confirmed = useMemo(
    () => new URLSearchParams(window.location.search).get("confirmed") === "1",
    [],
  );
  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState(confirmed
    ? "Your email is confirmed. Sign in to continue."
    : "");

  useEffect(() => {
    if (isAuthenticated) window.location.replace(redirectTo);
  }, [isAuthenticated, redirectTo]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");

    if (!supabase) {
      setErrorMessage("Sign-in is not configured yet. Please try again later.");
      return;
    }

    setPending(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        window.location.replace(redirectTo);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: fullName.trim() ? { full_name: fullName.trim() } : {},
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
        },
      });
      if (error) throw error;
      if (data.session) {
        window.location.replace(redirectTo);
        return;
      }
      setNotice("Check your inbox for a confirmation link. Confirm your email, then return here to sign in.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We couldn't complete sign-in. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="min-h-[70vh] pt-28 pb-16 bg-[oklch(0.88_0.025_66/0.84)]">
      <div className="container max-w-xl">
        <Link href="/">
          <span className="inline-flex items-center gap-2 font-sans text-xs tracking-[0.12em] uppercase text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] cursor-pointer mb-8">
            <ArrowLeft size={14} /> Back to the store
          </span>
        </Link>

        <div className="border border-[oklch(0.88_0.015_75)] bg-white p-7 sm:p-10 shadow-sm">
          <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-[oklch(0.62_0.12_70)] mb-3">
            OmaLuxe Customer Account
          </p>
          <h1 className="font-serif text-3xl font-light text-[oklch(0.18_0.015_60)] mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] mb-7">
            Sign in securely to view your orders, wishlist, and checkout.
          </p>

          <div className="grid grid-cols-2 border-b border-[oklch(0.88_0.015_75)] mb-7" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              onClick={() => { setMode("signin"); setErrorMessage(""); setNotice(""); }}
              className={`py-3 font-sans text-xs tracking-[0.12em] uppercase border-b-2 ${mode === "signin" ? "border-[oklch(0.62_0.12_70)] text-[oklch(0.38_0.07_55)]" : "border-transparent text-[oklch(0.52_0.02_60)]"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              onClick={() => { setMode("signup"); setErrorMessage(""); setNotice(""); }}
              className={`py-3 font-sans text-xs tracking-[0.12em] uppercase border-b-2 ${mode === "signup" ? "border-[oklch(0.62_0.12_70)] text-[oklch(0.38_0.07_55)]" : "border-transparent text-[oklch(0.52_0.02_60)]"}`}
            >
              Create account
            </button>
          </div>

          {confirmed && mode === "signin" && !notice && (
            <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 font-sans text-sm text-green-800" role="status">
              Your email is confirmed. Sign in to continue.
            </div>
          )}
          {notice && (
            <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 font-sans text-sm text-green-800" role="status">
              {notice}
            </div>
          )}
          {errorMessage && (
            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800" role="alert">
              {errorMessage}
            </div>
          )}
          {!isSupabaseConfigured && (
            <div className="mb-5 border border-amber-200 bg-amber-50 px-4 py-3 font-sans text-sm text-amber-900" role="status">
              Authentication is not configured for this deployment yet.
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2">
                  Name <span className="normal-case tracking-normal text-[oklch(0.62_0.02_60)]">(optional)</span>
                </label>
                <input
                  id="fullName"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
              />
            </div>
            <button
              type="submit"
              disabled={pending || loading || !isSupabaseConfigured}
              className="btn-luxury w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending || loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "signup" && (
            <p className="font-sans text-xs leading-relaxed text-[oklch(0.52_0.02_60)] mt-5">
              We’ll email you a confirmation link before your account can sign in.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
