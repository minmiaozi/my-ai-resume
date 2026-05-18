export const USERS_KEY = "resumeaipro_users";
export const SESSION_KEY = "resumeaipro_session";
export const SMS_PREFIX = "resumeaipro_sms_";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^1[3-9]\d{9}$/;

export const SMS_COOLDOWN_SEC = 60;
export const SMS_TTL_MS = 5 * 60 * 1000;

export type AuthMode = "login" | "register";

export type Session = {
  type: "email" | "phone" | "google";
  identifier: string;
  displayName: string;
};

export type StoredUser = {
  email?: string;
  phone?: string;
  password?: string | null;
  googleId?: string | null;
  name?: string;
  picture?: string;
  provider?: string;
};

function storageAvailable() {
  return typeof window !== "undefined";
}

export function loadUsers(): StoredUser[] {
  if (!storageAvailable()) return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  if (!storageAvailable()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Session | null {
  if (!storageAvailable()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (!storageAvailable()) return;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("resumeaipro:session", { detail: session }));
}

export function isPhone(value: string) {
  return PHONE_RE.test(value.trim());
}

export function isEmail(value: string) {
  return EMAIL_RE.test(value.trim());
}

export function accountKind(value: string): "phone" | "email" | null {
  const v = value.trim();
  if (isPhone(v)) return "phone";
  if (isEmail(v)) return "email";
  return null;
}

export function validateAccount(value: string): string {
  const v = value.trim();
  if (!v) return "Enter your email or phone number";
  if (!accountKind(v)) {
    if (/^\d+$/.test(v)) return "Enter an 11-digit mobile number";
    return "Enter a valid email or phone number";
  }
  return "";
}

export function validatePassword(value: string, optional = false): string {
  if (!value) return optional ? "" : "Enter your password";
  if (value.length < 8) return "Use at least 8 characters";
  if (!/[A-Za-z]/.test(value)) return "Include at least one letter";
  if (!/\d/.test(value)) return "Include at least one number";
  return "";
}

export function validateCode(value: string): string {
  if (!value.trim()) return "Enter the verification code";
  if (!/^\d{6}$/.test(value.trim())) return "Code must be 6 digits";
  return "";
}

export function findUserByEmail(email: string) {
  return loadUsers().find((u) => u.email === email.trim().toLowerCase());
}

export function findUserByPhone(phone: string) {
  return loadUsers().find((u) => u.phone === phone.trim());
}

export function storeSmsCode(phone: string, code: string) {
  sessionStorage.setItem(
    SMS_PREFIX + phone,
    JSON.stringify({ code, expires: Date.now() + SMS_TTL_MS })
  );
}

export function verifySmsCode(phone: string, code: string) {
  const raw = sessionStorage.getItem(SMS_PREFIX + phone);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as { code: string; expires: number };
    if (Date.now() > data.expires) return false;
    return data.code === code.trim();
  } catch {
    return false;
  }
}

export function maskPhone(phone: string) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}
