import { useAuth } from "@/_core/hooks/useAuth";
import { getPostLoginPath } from "@/const";
import {
  firebaseAuth,
  firebasePersistenceReady,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  verifyPasswordResetCode,
} from "firebase/auth";
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";

type AuthMode = "signin" | "signup" | "forgot" | "recovery";

function getFriendlyAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return "We couldn't complete the request. Please try again.";
  }
  switch (error.code) {
    case "auth/email-already-in-use":
      return "There’s already an account for this email. Sign in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password combination doesn’t match an account.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Choose a password with at least 8 characters.";
    case "auth/expired-action-code":
    case "auth/invalid-action-code":
      return "This password-reset link has expired or was already used. Request a new one.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "A network issue interrupted the request. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is not enabled for this Firebase project.";
    default:
      return "We couldn't complete the request. Please try again.";
  }
}

function initialMode(): AuthMode {
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "resetPassword" && params.has("oobCode")
    ? "recovery"
    : "signin";
}

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const redirectTo = useMemo(() => getPostLoginPath(), []);
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const oobCode = params.get("oobCode");
  const confirmed = params.get("confirmed") === "1";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pending, setPending] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [recoveryCompleted, setRecoveryCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState(
    confirmed ? "Your email is confirmed. Sign in to continue." : ""
  );

  useEffect(() => {
    if (isAuthenticated && mode !== "recovery") {
      window.location.replace(redirectTo);
    }
  }, [isAuthenticated, mode, redirectTo]);

  useEffect(() => {
    if (mode !== "recovery" || !oobCode || !firebaseAuth) return;
    let active = true;
    void verifyPasswordResetCode(firebaseAuth, oobCode)
      .then((verifiedEmail) => {
        if (active) setEmail(verifiedEmail);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(getFriendlyAuthError(error));
      });
    return () => {
      active = false;
    };
  }, [mode, oobCode]);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage("");
    setNotice("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRecoveryCompleted(false);
    setPendingVerification(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");

    if (!firebaseAuth || !isFirebaseConfigured) {
      setErrorMessage("Sign-in is not configured yet. Please try again later.");
      return;
    }
    if ((mode === "signin" || mode === "signup") && !termsAccepted) {
      setErrorMessage(
        "Please accept the Terms and Conditions and Data Protection Policy to continue."
      );
      return;
    }
    if (mode === "recovery" && password !== confirmPassword) {
      setErrorMessage("The passwords do not match. Please check and try again.");
      return;
    }
    if ((mode === "signup" || mode === "recovery") && password.length < 8) {
      setErrorMessage("Choose a password with at least 8 characters.");
      return;
    }

    setPending(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      await firebasePersistenceReady;
      if (mode === "signin") {
        const credential = await signInWithEmailAndPassword(
          firebaseAuth,
          normalizedEmail,
          password
        );
        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
          setPendingVerification(true);
          setNotice(
            `Please verify ${normalizedEmail}. We’ve sent a fresh verification link.`
          );
          return;
        }
        await credential.user.getIdToken(true);
        window.location.replace(redirectTo);
        return;
      }

      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(
          firebaseAuth,
          normalizedEmail,
          password
        );
        const displayName = fullName.trim();
        if (displayName) {
          await updateProfile(credential.user, { displayName });
        }
        await sendEmailVerification(credential.user);
        setPendingVerification(true);
        setNotice(
          `Check your inbox for a verification link. Confirm your email, then return here to sign in (${normalizedEmail}).`
        );
        return;
      }

      if (mode === "forgot") {
        await sendPasswordResetEmail(firebaseAuth, normalizedEmail);
        setNotice(
          "If an account exists for this email, you’ll receive a password reset link shortly."
        );
        return;
      }

      if (!oobCode) {
        setErrorMessage("Open the password-reset link from your email to choose a new password.");
        return;
      }
      await confirmPasswordReset(firebaseAuth, oobCode, password);
      setPassword("");
      setConfirmPassword("");
      setRecoveryCompleted(true);
      setNotice("Your password has been updated. You can continue to sign in.");
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    } finally {
      setPending(false);
    }
  };

  const resendVerification = async () => {
    const user = firebaseAuth?.currentUser;
    if (!user) {
      setErrorMessage("Sign in with your email and password first, then request another link.");
      return;
    }
    setErrorMessage("");
    setNotice("");
    setPending(true);
    try {
      await sendEmailVerification(user);
      setNotice(`A new verification link has been sent to ${user.email ?? email}.`);
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    } finally {
      setPending(false);
    }
  };

  const confirmVerification = async () => {
    const user = firebaseAuth?.currentUser;
    if (!user) {
      setPendingVerification(false);
      setErrorMessage("Sign in again after verifying your email address.");
      return;
    }
    setErrorMessage("");
    setNotice("");
    setPending(true);
    try {
      await reload(user);
      if (!user.emailVerified) {
        setErrorMessage("Your address isn’t verified yet. Open the link in your email, then try again.");
        return;
      }
      await user.getIdToken(true);
      window.location.replace(redirectTo);
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
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
            <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 font-sans text-sm text-green-800" role="status">
              {notice}
            </div>
          )}
          {errorMessage && (
            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800" role="alert">
              {errorMessage}
            </div>
          )}
          {!isFirebaseConfigured && (
            <div className="mb-5 border border-amber-200 bg-amber-50 px-4 py-3 font-sans text-sm text-amber-900" role="status">
              Authentication is not configured for this deployment yet.
            </div>
          )}
          {pendingVerification && (
            <div className="mb-5 border border-[oklch(0.82_0.08_75)] bg-[oklch(0.97_0.025_82)] p-4">
              <p className="font-serif text-lg text-[oklch(0.25_0.03_58)]">Verify your email to continue</p>
              <p className="mt-1 font-sans text-sm leading-6 text-[oklch(0.45_0.03_58)]">
                Your account is available after Firebase confirms control of this email address.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={confirmVerification} disabled={pending} className="btn-luxury text-xs py-2.5 px-4 disabled:opacity-60">
                  I’ve verified my email
                </button>
                <button type="button" onClick={resendVerification} disabled={pending} className="font-sans text-xs underline underline-offset-4 text-[oklch(0.38_0.07_55)] disabled:opacity-60">
                  Resend the link
                </button>
              </div>
            </div>
          )}

          {mode !== "recovery" && !recoveryCompleted && !pendingVerification ? (
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
                <label htmlFor="email" className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2">Email address</label>
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
              {(mode === "signin" || mode === "signup") && (
                <div>
                  <label htmlFor="password" className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={mode === "signup" ? 8 : undefined}
                      className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 pr-12 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]"
                    />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 text-[oklch(0.52_0.02_60)] hover:text-[oklch(0.38_0.07_55)]">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
              {mode === "signin" && (
                <div className="-mt-2 text-right">
                  <button type="button" onClick={() => changeMode("forgot")} className="font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 hover:text-[oklch(0.62_0.12_70)]">Forgot your password?</button>
                </div>
              )}
              {(mode === "signin" || mode === "signup") && (
                <label className="flex items-start gap-3 font-sans text-xs leading-relaxed text-[oklch(0.52_0.02_60)]">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    required
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[oklch(0.62_0.12_70)]"
                  />
                  <span>
                    I agree to the Terms and Conditions and the{" "}
                    <Link href="/data-protection">
                      <span className="text-[oklch(0.38_0.07_55)] underline underline-offset-4 cursor-pointer">Data Protection Policy</span>
                    </Link>.
                  </span>
                </label>
              )}
              <button type="submit" disabled={pending || loading || !isFirebaseConfigured} className="btn-luxury w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
                {pending || loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {pending ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </button>
            </form>
          ) : mode === "recovery" && !recoveryCompleted ? (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2">New password</label>
                <div className="relative">
                  <input id="newPassword" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 pr-12 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]" />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide new password" : "Show new password"} className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 text-[oklch(0.52_0.02_60)]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block font-sans text-xs tracking-[0.1em] uppercase text-[oklch(0.38_0.04_60)] mb-2">Confirm new password</label>
                <div className="relative">
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full border border-[oklch(0.88_0.015_75)] bg-white px-4 py-3 pr-12 font-sans text-sm text-[oklch(0.18_0.015_60)] outline-none focus:border-[oklch(0.62_0.12_70)]" />
                  <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"} className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-4 text-[oklch(0.52_0.02_60)]">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <button type="submit" disabled={pending || loading || !isFirebaseConfigured || !oobCode} className="btn-luxury w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
                {pending || loading ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {pending || loading ? "Please wait…" : "Update password"}
              </button>
            </form>
          ) : recoveryCompleted ? (
            <button type="button" onClick={() => { changeMode("signin"); setNotice("Your password has been updated. Sign in to continue."); }} className="btn-luxury w-full">Return to sign in</button>
          ) : null}

          {pendingVerification && (
            <p className="font-sans text-xs leading-relaxed text-[oklch(0.52_0.02_60)] mt-5">Check your inbox for a confirmation link before signing in.</p>
          )}
          {mode === "signup" && !pendingVerification && (
            <p className="font-sans text-xs leading-relaxed text-[oklch(0.52_0.02_60)] mt-5">We’ll email you a confirmation link before your account can sign in.</p>
          )}
          {mode === "forgot" && (
            <button type="button" onClick={() => changeMode("signin")} className="mt-5 font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 hover:text-[oklch(0.62_0.12_70)]">Back to sign in</button>
          )}
          {mode === "recovery" && !recoveryCompleted && (
            <button type="button" onClick={() => changeMode("forgot")} className="mt-5 font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 hover:text-[oklch(0.62_0.12_70)]">Request a new reset link</button>
          )}
          <p className="mt-6 border-t border-[oklch(0.88_0.015_75)] pt-5 text-center font-sans text-xs leading-relaxed text-[oklch(0.52_0.02_60)]">
            Your information is handled according to our{" "}
            <Link href="/data-protection"><span className="text-[oklch(0.38_0.07_55)] underline underline-offset-4 cursor-pointer">Data Protection Policy</span></Link>.
          </p>
          <Link href="/shop"><span className="mt-4 block text-center font-sans text-xs text-[oklch(0.38_0.07_55)] underline underline-offset-4 cursor-pointer">Continue as guest and shop</span></Link>
        </div>
      </div>
    </section>
  );
}
