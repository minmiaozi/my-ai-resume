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
  const showPassword = !(phoneMode && !isRegister);
  const showConfirm = isRegister && showPassword;

  return (
    <div className="auth-page">
      <div className={`auth-card${isRegister ? " is-register" : ""}`}>
        <div className="auth-header">
          <h1 className="auth-title">{isRegister ? "Sign up" : "Sign in"}</h1>
          <Link href="/" className="auth-brand">
            <span className="auth-brand-icon" aria-hidden>
              ⚡
            </span>
            <span className="auth-brand-name">ResumeAIPro</span>
          </Link>
        </div>

        <button
          type="button"
          className="auth-google-btn"
          onClick={() => void signInWithGoogle()}
          disabled={submitting}
        >
          <GoogleIcon />
          {isRegister ? "Sign up with Google" : "Continue with Google"}
        </button>

        <div className="auth-divider">or</div>

        {formError ? <div className="auth-form-error">{formError}</div> : null}

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div>
            <input
              className={`auth-input${fieldErrors.account ? " invalid" : ""}`}
              placeholder="Email or phone number"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              autoComplete="username"
            />
            {fieldErrors.account ? (
              <p className="auth-field-error">{fieldErrors.account}</p>
            ) : null}
          </div>

          {phoneMode ? (
            <div>
              <div className="auth-code-row">
                <input
                  className={`auth-input${fieldErrors.phoneCode ? " invalid" : ""}`}
                  placeholder="SMS code"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className="auth-code-btn"
                  onClick={sendSms}
                  disabled={smsLeft > 0}
                >
                  {smsLeft > 0 ? `${smsLeft}s` : "Send code"}
                </button>
              </div>
              {fieldErrors.phoneCode ? (
                <p className="auth-field-error">{fieldErrors.phoneCode}</p>
              ) : null}
            </div>
          ) : null}

          {showPassword ? (
            <div>
              <input
                type="password"
                className={`auth-input${fieldErrors.password ? " invalid" : ""}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              {fieldErrors.password ? (
                <p className="auth-field-error">{fieldErrors.password}</p>
              ) : null}
            </div>
          ) : null}

          {showConfirm ? (
            <div>
              <input
                type="password"
                className={`auth-input${fieldErrors.confirm ? " invalid" : ""}`}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {fieldErrors.confirm ? (
                <p className="auth-field-error">{fieldErrors.confirm}</p>
              ) : null}
            </div>
          ) : null}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {isRegister ? "Sign up" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          className="auth-forgot"
          onClick={() =>
            alert("Demo: sign in with Google, or contact support to reset your password.")
          }
        >
          Forgot your password?
        </button>

        <p className="auth-switch">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
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
