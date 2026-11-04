import { useAuth } from "@/_core/hooks/useAuth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";

type AuthMode = "signin" | "signup" | "forgot" | "recovery";

function safeInternalRedirect(value: string | null): string {
  if (!value) return "/";
  try {
    const destination = new URL(value, window.location.origin);
    if (
      destination.origin !== window.location.origin ||
      destination.pathname === "/login"
    ) {
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
    []
  );
  const [mode, setMode] = useState<AuthMode>(() =>
    new URLSearchParams(window.location.search).get("reset") === "1"
      ? "recovery"
      : "signin"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [recoveryCompleted, setRecoveryCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState(
    confirmed ? "Your email is confirmed. Sign in to continue." : ""
  );

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery");
        setNotice("");
        setErrorMessage("");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated && mode !== "recovery")
      window.location.replace(redirectTo);
  }, [isAuthenticated, mode, redirectTo]);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage("");
    setNotice("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRecoveryCompleted(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");

    if (!supabase) {
      setErrorMessage("Sign-in is not configured yet. Please try again later.");
      return;
    }

    if (mode === "recovery" && password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match. Please check and try again."
      );
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

      if (mode === "signup") {
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
        setNotice(
          "Check your inbox for a confirmation link. Confirm your email, then return here to sign in."
        );
        return;
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            // Reuse the existing allowlisted callback; PASSWORD_RECOVERY selects the reset view.
            redirectTo: `${window.location.origin}/login?confirmed=1`,
          }
        );
        if (error) throw error;
        setNotice(
          "If an account exists for this email, you’ll receive a password reset link shortly."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      setRecoveryCompleted(true);
      setNotice(
        "Your password has been updated. You can continue to your account."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't complete the request. Please try again."
      );
    } finally {
      setPending(false);
    }
  };

  const title =
    mode === "signup"
      ? "Create your account"
      : mode === "forgot"
        ? "Reset your password"
        : mode === "recovery"
          ? "Choose a new password"
          : "Welcome back";
  const description =
    mode === "signup"
      ? "Create an account to save your wishlist, view orders, and check out with ease."
      : mode === "forgot"
        ? "Enter the email address associated with your account and we’ll send a reset link."
        : mode === "recovery"
          ? "Choose a new password for your OmaLuxe account."
          : "Sign in securely to view your orders, wishlist, and checkout.";

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
            {title}
          </h1>
          <p className="font-sans text-sm text-[oklch(0.52_0.02_60)] mb-7">
            {description}
          </p>

          {(mode === "signin" || mode === "signup") && (
            <div
              className="grid grid-cols-2 border-b border-[oklch(0.88_0.015_75)] mb-7"
              role="tablist"
              aria-label="Account access"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                onClick={() => changeMode("signin")}
                className={`py-3 font-sans text-xs tracking-[0.12em] uppercase border-b-2 ${mode === "signin" ? "border-[oklch(0.62_0.12_70)] text-[oklch(0.38_0.07_55)]" : "border-transparent text-[oklch(0.52_0.02_60)]"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                onClick={() => changeMode("signup")}
                className={`py-3 font-sans text-xs tracking-[0.12em] uppercase border-b-2 ${mode === "signup" ? "border-[oklch(0.62_0.12_70)] text-[oklch(0.38_0.07_55)]" : "border-transparent text-[oklch(0.52_0.02_60)]"}`}
              >
                Create account
              </button>
            </div>
          )}

          {notice && (
            <div
              className="mb-5 border border-green-200 bg-green-50 px-4 py-3 font-sans text-sm text-green-800"
              role="status"
            >
              {notice}
            </div>
          )}
          {errorMessage && (
            <div
              className="mb-5 border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800"
              role="alert"
            >
              {errorMessage}
            </div>
          )}
          {!isSupabaseConfigured && (
            <div
              className="mb-5 border border-amber-200 bg-amber-50 px-4 py-3 font-sans text-sm text-amber-900"
              role="status"
            >
              Authentication is not configured for this deployment yet.
            </div>
          )}

          {mode !== "recovery" && !recoveryCompleted ? (
            <form onSubmit={submit} className="space-y-5">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2"
                  >
                    Name{" "}
                    <span className="normal-case tracking-normal text-[oklch(0.62_0.02_60)]">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="fullName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={event => setFullName(event.target.value)}
                    className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
                  />
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
                />
              </div>
              {(mode === "signin" || mode === "signup") && (
                <div>
                  <label
                    htmlFor="password"
                    className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      required
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 pr-12 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(visible => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_70)]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
              {mode === "signin" && (
                <div className="-mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => changeMode("forgot")}
                    className="font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 hover:text-[oklch(0.62_0.12_70)]"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={pending || loading || !isSupabaseConfigured}
                className="btn-luxury w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending || loading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : null}
                {pending
                  ? "Please wait…"
                  : mode === "signin"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
              </button>
            </form>
          ) : mode === "recovery" && !recoveryCompleted ? (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 pr-12 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(visible => !visible)}
                    aria-label={
                      showPassword ? "Hide new password" : "Show new password"
                    }
                    aria-pressed={showPassword}
                    title={
                      showPassword ? "Hide new password" : "Show new password"
                    }
                    className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_70)]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2"
                >
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 pr-12 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(visible => !visible)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password confirmation"
                        : "Show password confirmation"
                    }
                    aria-pressed={showConfirmPassword}
                    title={
                      showConfirmPassword
                        ? "Hide password confirmation"
                        : "Show password confirmation"
                    }
                    className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_70)]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={pending || loading || !isSupabaseConfigured}
                className="btn-luxury w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending || loading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : null}
                {pending || loading ? "Please wait…" : "Update password"}
              </button>
            </form>
          ) : recoveryCompleted ? (
            <button
              type="button"
              onClick={() => window.location.replace(redirectTo)}
              className="btn-luxury w-full"
            >
              Continue to your account
            </button>
          ) : null}

          {mode === "signup" && (
            <p className="font-sans text-xs leading-relaxed text-[oklch(0.52_0.02_60)] mt-5">
              We’ll email you a confirmation link before your account can sign
              in.
            </p>
          )}
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => changeMode("signin")}
              className="mt-5 font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 hover:text-[oklch(0.62_0.12_70)]"
            >
              Back to sign in
            </button>
          )}
          {mode === "recovery" && !recoveryCompleted && (
            <button
              type="button"
              onClick={() => changeMode("forgot")}
              className="mt-5 font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 hover:text-[oklch(0.62_0.12_70)]"
            >
              Request a new reset link
            </button>
          )}
          <p className="mt-6 border-t border-[oklch(0.88_0.015_75)] pt-5 text-center font-sans text-xs leading-relaxed text-[oklch(0.52_0.02_60)]">
            Your information is handled according to our{" "}
            <Link href="/data-protection">
              <span className="text-[oklch(0.38_0.07_55)] underline underline-offset-4 cursor-pointer">
                Data Protection Policy
              </span>
            </Link>
            .
          </p>
          <Link href="/shop">
            <span className="mt-4 block text-center font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 cursor-pointer">
              Continue as guest and shop
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
