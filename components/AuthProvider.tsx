"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import AuthForm from "@/components/AuthForm";
import type { AuthMode } from "@/lib/auth";

type AuthContextValue = {
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const closeAuth = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, []);

  const openAuth = useCallback((nextMode?: AuthMode) => {
    if (nextMode) setMode(nextMode);
    setOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeAuth]);

  return (
    <AuthContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      {open ? (
        <div
          className="auth-overlay open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="authTitle"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuth();
          }}
        >
          <AuthForm
            key={mode}
            initialMode={mode}
            onClose={closeAuth}
            redirectOnSuccess={false}
          />
        </div>
      ) : null}
    </AuthContext.Provider>
  );
}
