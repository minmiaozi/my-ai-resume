"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SMS_COOLDOWN_SEC,
  accountKind,
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
import { supabase } from "@/lib/supabase";
import { appUrl } from "@/lib/app-url";

export type AuthFormProps = {
  initialMode?: AuthMode;
  onClose?: () => void;
  /** When false, stay on current page after sign-in (modal). Default true. */
  redirectOnSuccess?: boolean;
};

export default function AuthForm({
  initialMode: initialModeProp = "login",
  onClose,
  redirectOnSuccess = true,
}: AuthFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>(initialModeProp);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [smsLeft, setSmsLeft] = useState(0);
  const smsTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const kind = accountKind(account);
  const phoneMode = kind === "phone";

  useEffect(() => {
    setMode(initialModeProp);
  }, [initialModeProp]);

  useEffect(() => {
    return () => {
      if (smsTimer.current) clearInterval(smsTimer.current);
    };
  }, []);

  const finishAuth = useCallback(() => {
    onClose?.();
    if (redirectOnSuccess) router.push("/");
  }, [onClose, redirectOnSuccess, router]);

  const clearErrors = useCallback(() => {
    setFormError("");
    setFieldErrors({});
  }, []);

  const setField = (key: string, msg: string) => {
    setFieldErrors((e) => ({ ...e, [key]: msg }));
  };

  const signInWithGoogle = async () => {
    clearErrors();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: appUrl("/auth/callback"),
          queryParams: {
            access_type: "offline",
            prompt: mode === "register" ? "consent" : "select_account",
          },
        },
      });
      if (error) {
        setFormError("Google 登录失败：" + error.message);
        setSubmitting(false);
      }
    } catch {
      setFormError("无法启动 Google 登录，请检查 Supabase 是否已启用 Google Provider");
      setSubmitting(false);
    }
  };

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[AuthForm] 表单提交", { mode, account, passwordLen: password.length });
    clearErrors();
    const acc = account.trim();
    const k = accountKind(acc);
    const aErr = validateAccount(acc);
    if (aErr) setField("account", aErr);
    if (!k) {
      console.warn("[AuthForm] 账号格式无效，停止提交", { account: acc, aErr });
      return;
    }

    setSubmitting(true);
    try {
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
        if (aErr || pErr) {
          console.warn("[AuthForm] 校验未通过", { aErr, pErr });
          return;
        }
        if (mode === "register" && (!confirm || confirm !== password)) {
          console.warn("[AuthForm] 确认密码未通过", { hasConfirm: !!confirm });
          return;
        }

        const email = acc.toLowerCase();

        if (mode === "login") {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          console.log("登录结果：", data, error);
          if (error) {
            setFormError("登录失败：" + error.message);
            console.error("登录错误详情：", error);
            return;
          }
          setSession({
            type: "email",
            identifier: email,
            displayName: data.user?.email ?? email,
          });
        } else {
          console.log("开始注册...", email, password);
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: appUrl("/auth/callback"),
            },
          });
          console.log("注册结果：", data, error);
          if (error) {
            setFormError("注册失败：" + error.message);
            console.error("注册错误详情：", error);
            return;
          }
          if (!data.user) {
            setFormError("注册请求已发送，请检查邮箱验证链接");
            return;
          }
          setSession({
            type: "email",
            identifier: email,
            displayName: data.user.email ?? email,
          });
        }
      }

      finishAuth();
    } catch (err) {
      console.error("认证异常：", err);
      setFormError("认证异常：" + String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isRegister = mode === "register";
  const showPassword = !(phoneMode && !isRegister);
  const showConfirm = isRegister && showPassword;

  return (
    <div className={`auth-card${isRegister ? " is-register" : ""}`}>
      {onClose ? (
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      ) : null}

      <div className="auth-header">
        <h1 className="auth-title" id="authTitle">
          {isRegister ? "Sign up" : "Sign in"}
        </h1>
        <Link
          href="/"
          className="auth-brand"
          onClick={(e) => {
            if (onClose) {
              e.preventDefault();
              onClose();
            }
          }}
        >
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
