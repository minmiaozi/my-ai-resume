"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/AuthProvider";
import { getSession, setSession, type Session } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function sessionFromSupabaseUser(user: {
  id: string;
  email?: string | null;
  app_metadata?: { provider?: string };
  user_metadata?: { full_name?: string; name?: string };
  identities?: { provider: string }[];
}): Session {
  const email = user.email ?? user.id;
  const isGoogle =
    user.app_metadata?.provider === "google" ||
    user.identities?.some((i) => i.provider === "google");

  return {
    type: isGoogle ? "google" : "email",
    identifier: email,
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0],
  };
}

export default function NavAuth() {
  const t = useTranslations("homepage.nav");
  const { openAuth } = useAuth();
  const [session, setLocalSession] = useState<Session | null>(null);

  useEffect(() => {
    async function syncSession() {
      const local = getSession();
      if (local) {
        setLocalSession(local);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const next = sessionFromSupabaseUser(data.user);
        setSession(next);
        setLocalSession(next);
      }
    }

    void syncSession();

    const onSession = () => setLocalSession(getSession());
    window.addEventListener("resumeaipro:session", onSession);

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession?.user) {
        const next = sessionFromSupabaseUser(authSession.user);
        setSession(next);
        setLocalSession(next);
      } else {
        setSession(null);
        setLocalSession(null);
      }
    });

    return () => {
      window.removeEventListener("resumeaipro:session", onSession);
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (session) {
    return (
      <div className="nav-auth-user visible">
        <span className="nav-user-label">{session.displayName || session.identifier}</span>
        <button
          type="button"
          className="nav-user-logout"
          onClick={() => {
            void supabase.auth.signOut();
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
        {t("signIn")}
      </button>
      <button
        type="button"
        className="nav-auth-btn nav-auth-btn-primary"
        onClick={() => openAuth("register")}
      >
        {t("signUp")}
      </button>
    </div>
  );
}
