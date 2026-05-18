"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SMS_COOLDOWN_SEC,
  accountKind,
  findUserByEmail,
  findUserByPhone,
  loadUsers,
  maskPhone,
  saveUsers,
  setSession,
  storeSmsCode,
  validateAccount,
  validateCode,
  validatePassword,
  verifySmsCode,
  type AuthMode,
} from "@/lib/auth";
import { fetchPublicConfig } from "@/lib/billing";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [smsLeft, setSmsLeft] = useState(0);
  const smsTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const kind = accountKind(account);
  const phoneMode = kind === "phone";

  useEffect(() => {
    fetchPublicConfig().then((c) => {
      if (typeof c.googleClientId === "string") setGoogleClientId(c.googleClientId);
    });
    return () => {
      if (smsTimer.current) clearInterval(smsTimer.current);
    };
  }, []);

  const clearErrors = useCallback(() => {
    setFormError("");
    setFieldErrors({});
  }, []);

  const setField = (key: string, msg: string) => {
    setFieldErrors((e) => ({ ...e, [key]: msg }));
  };

  const completeGoogle = (profile: {
    email: string;
    sub?: string;
    name?: string;
  }) => {
    const email = profile.email.trim().toLowerCase();
    const users = loadUsers();
    let user = users.find((u) => u.email === email || (profile.sub && u.googleId === profile.sub));
    if (!user) {
      user = {
        email,
        googleId: profile.sub || null,
        name: profile.name || "",
        provider: "google",
      };
      users.push(user);
      saveUsers(users);
    } else if (!user.googleId && profile.sub) {
      user.googleId = profile.sub;
      user.provider = "google";
      saveUsers(users);
    }
    setSession({
      type: "google",
      identifier: email,
      displayName: profile.name || email.split("@")[0],
    });
    router.push("/");
  };

  const signInWithGoogle = async () => {
    clearErrors();
    if (!googleClientId) {
      const email = prompt(
        "Demo mode: enter your Gmail address (set GOOGLE_CLIENT_ID in .env.local for one-click sign-in)",
        "you@gmail.com"
      );
      if (!email) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setFormError("Enter a valid email address");
        return;
      }
      completeGoogle({ email: email.trim(), sub: "demo_" + email, name: email.split("@")[0] });
      return;
    }

    try {
      await loadGoogleScript();
      const g = window.google;
      if (!g?.accounts?.oauth2) throw new Error("Google SDK unavailable");

      g.accounts.oauth2
        .initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenResponse: { error?: string; access_token?: string }) => {
            if (tokenResponse.error) {
              setFormError("Google authorization failed");
              return;
            }
            try {
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: "Bearer " + tokenResponse.access_token },
              });
              if (!res.ok) throw new Error("userinfo");
              const data = await res.json();
              completeGoogle({
                email: data.email,
                sub: data.sub,
                name: data.name,
              });
            } catch {
              setFormError("Google sign-in failed. Please try again.");
            }
          },
        })
        .requestAccessToken({ prompt: mode === "register" ? "consent" : "" });
    } catch {
      setFormError("Could not load Google sign-in");
    }
  };

  function loadGoogleScript(): Promise<void> {
    if (window.google?.accounts) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("script"));
      document.head.appendChild(s);
    });
  }

  const sendSms = () => {
    const err = validateAccount(account);
    if (err || !phoneMode) {
      setField("account", err || "Enter your phone number");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    storeSmsCode(account.trim(), code);
    alert("Demo code: " + code);
    let left = SMS_COOLDOWN_SEC;
    setSmsLeft(left);
    if (smsTimer.current) clearInterval(smsTimer.current);
    smsTimer.current = setInterval(() => {
      left -= 1;
      setSmsLeft(left);
      if (left <= 0 && smsTimer.current) {
        clearInterval(smsTimer.current);
        smsTimer.current = null;
      }
    }, 1000);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const acc = account.trim();
    const k = accountKind(acc);
    const aErr = validateAccount(acc);
    if (aErr) setField("account", aErr);
    if (!k) return;

    if (k === "phone") {
      const cErr = validateCode(phoneCode);
      if (cErr) setField("phoneCode", cErr);
      if (aErr || cErr) return;
      if (!verifySmsCode(acc, phoneCode)) {
        setFormError("Invalid or expired verification code");
        return;
      }
      const users = loadUsers();
      if (mode === "login") {
        const user = findUserByPhone(acc);
        if (!user) {
          setFormError("This phone number is not registered yet");
          return;
        }
        setSession({
          type: "phone",
          identifier: user.phone!,
          displayName: maskPhone(user.phone!),
        });
      } else {
        const pErr = validatePassword(password);
        if (pErr) setField("password", pErr);
        if (password !== confirm) setField("confirm", "Passwords do not match");
        if (pErr || password !== confirm) return;
        if (users.some((u) => u.phone === acc)) {
          setFormError("This phone number is already registered");
          return;
        }
        users.push({ phone: acc, password });
        saveUsers(users);
        setSession({ type: "phone", identifier: acc, displayName: maskPhone(acc) });
      }
    } else {
      const pErr = validatePassword(password);
      if (pErr) setField("password", pErr);
      if (mode === "register") {
        if (!confirm) setField("confirm", "Confirm your password");
        else if (confirm !== password) setField("confirm", "Passwords do not match");
      }
      if (aErr || pErr) return;
      if (mode === "register" && (!confirm || confirm !== password)) return;

      const email = acc.toLowerCase();
      const users = loadUsers();
      if (mode === "login") {
        const user = findUserByEmail(email);
        if (!user || user.password !== password) {
          setFormError(
            user?.provider === "google"
              ? "Sign in with Google for this email"
              : "Incorrect email or password"
          );
          return;
        }
        setSession({ type: "email", identifier: user.email!, displayName: user.email! });
      } else {
        if (users.some((u) => u.email === email)) {
          setFormError("This email is already registered");
          return;
        }
        users.push({ email, password });
        saveUsers(users);
        setSession({ type: "email", identifier: email, displayName: email });
      }
    }

    router.push("/");
  };

  const isRegister = mode === "register";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#0a192f_0%,#1e3a8a_50%,#1e40af_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(245,158,11,0.22),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-slate-900/20">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              {isRegister ? "Sign up" : "Sign in"}
            </h1>
            <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#0a192f,#1e3a8a)] text-white">
                ⚡
              </span>
              ResumeAIPro
            </Link>
          </div>

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
          >
            <GoogleIcon />
            {isRegister ? "Sign up with Google" : "Continue with Google"}
          </button>

          <div className="mb-6 flex items-center gap-4 text-sm text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          {formError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <input
                className={`${inputClass} ${fieldErrors.account ? "border-red-400" : ""}`}
                placeholder="Email or phone number"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                autoComplete="username"
              />
              {fieldErrors.account ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.account}</p>
              ) : null}
            </div>

            {phoneMode ? (
              <div className="flex gap-2">
                <input
                  className={`${inputClass} flex-1 ${fieldErrors.phoneCode ? "border-red-400" : ""}`}
                  placeholder="SMS code"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-semibold disabled:opacity-50"
                  onClick={sendSms}
                  disabled={smsLeft > 0}
                >
                  {smsLeft > 0 ? `${smsLeft}s` : "Send code"}
                </button>
              </div>
            ) : null}
            {fieldErrors.phoneCode ? (
              <p className="text-xs text-red-600">{fieldErrors.phoneCode}</p>
            ) : null}

            {!(phoneMode && !isRegister) ? (
              <div>
                <input
                  type="password"
                  className={`${inputClass} ${fieldErrors.password ? "border-red-400" : ""}`}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                {fieldErrors.password ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                ) : null}
              </div>
            ) : null}

            {isRegister && !(phoneMode && !isRegister) ? (
              <div>
                <input
                  type="password"
                  className={`${inputClass} ${fieldErrors.confirm ? "border-red-400" : ""}`}
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
                {fieldErrors.confirm ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.confirm}</p>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-blue-600 py-3.5 text-[16px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isRegister ? "Sign up" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            className="mt-4 block w-full text-center text-sm text-slate-600 hover:text-blue-600"
            onClick={() => alert("Demo: sign in with Google, or contact support to reset your password.")}
          >
            Forgot your password?
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-blue-600"
                  onClick={() => {
                    setMode("login");
                    clearErrors();
                  }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-blue-600"
                  onClick={() => {
                    setMode("register");
                    clearErrors();
                  }}
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.56 2.95-2.24 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { error?: string; access_token?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}
