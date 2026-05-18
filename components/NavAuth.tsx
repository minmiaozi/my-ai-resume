"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSession, setSession, type Session } from "@/lib/auth";

export default function NavAuth() {
  const { openAuth } = useAuth();
  const [session, setLocalSession] = useState<Session | null>(null);

  useEffect(() => {
    setLocalSession(getSession());
    const onSession = () => setLocalSession(getSession());
    window.addEventListener("resumeaipro:session", onSession);
    return () => window.removeEventListener("resumeaipro:session", onSession);
  }, []);

  if (session) {
    return (
      <div className="nav-auth-user visible">
        <span className="nav-user-label">{session.displayName || session.identifier}</span>
        <button
          type="button"
          className="nav-user-logout"
          onClick={() => {
            setSession(null);
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="nav-auth">
      <button type="button" className="nav-auth-btn" onClick={() => openAuth("login")}>
        Sign in
      </button>
      <button
        type="button"
        className="nav-auth-btn nav-auth-btn-primary"
        onClick={() => openAuth("register")}
      >
        Sign up
      </button>
    </div>
  );
}
