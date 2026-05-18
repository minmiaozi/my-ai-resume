"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, setSession, type Session } from "@/lib/auth";

export default function NavAuth() {
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
      <Link href="/auth" className="nav-auth-btn">
        Sign in
      </Link>
      <Link href="/auth?mode=register" className="nav-auth-btn nav-auth-btn-primary">
        Sign up
      </Link>
    </div>
  );
}

