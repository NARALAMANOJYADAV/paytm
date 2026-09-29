"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CoordinatorPermission, ParticipantProfile, Registration, Ticket, User, UserRole } from "../types";
import { applyState, clearStore, loadStore } from "../store";
import { supabaseBrowser } from "../supabaseBrowser";

export interface LoginResponse {
  success: boolean;
  error?: string;
  role?: UserRole;
}

interface AuthContextType {
  /** true until the first session + state load finishes */
  loading: boolean;
  currentUser: User | null;
  currentProfile: ParticipantProfile | null;
  currentRegistration: Registration | null;
  currentTicket: Ticket | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  permissions: CoordinatorPermission[];
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<LoginResponse>;
  refreshAuth: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Me {
  id: string;
  role: UserRole;
  permissions: CoordinatorPermission[];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [storeVersion, setStoreVersion] = useState(0);

  // One /api/state request per sync; concurrent callers (login + auth-change event) share it.
  const inflight = useRef<Promise<Me | null> | null>(null);
  const sync = useCallback((): Promise<Me | null> => {
    if (inflight.current) return inflight.current;
    inflight.current = (async () => {
      try {
        const { data } = await supabaseBrowser().auth.getSession();
        const res = await fetch("/api/state", {
          headers: data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {},
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        const next: Me | null =
          json?.ok && json.data.me ? { id: json.data.me.id, role: json.data.me.role, permissions: json.data.me.permissions } : null;
        if (json?.ok) applyState(json.data.state);
        setMe(next);
        return next;
      } finally {
        setLoading(false);
        inflight.current = null;
      }
    })();
    return inflight.current;
  }, []);

  useEffect(() => {
    void Promise.resolve().then(sync);
    const { data: sub } = supabaseBrowser().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") sync();
    });
    const onStore = () => setStoreVersion((n) => n + 1);
    window.addEventListener("store_updated", onStore);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("store_updated", onStore);
    };
  }, [sync]);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) return { success: false, error: error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message };
    const who = await sync();
    if (!who) {
      await supabaseBrowser().auth.signOut();
      return { success: false, error: "This account is not active for the event." };
    }
    return { success: true, role: who.role };
  };

  const logout = async () => {
    await supabaseBrowser().auth.signOut();
    setMe(null);
    clearStore();
    await sync();
  };

  const sendPasswordReset = async (email: string): Promise<LoginResponse> => {
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login?reset=1`,
    });
    return error ? { success: false, error: error.message } : { success: true };
  };

  const value = useMemo<AuthContextType>(() => {
    const s = loadStore();
    const currentUser = me ? s.users.find((u) => u.id === me.id) ?? null : null;
    const currentProfile = me?.role === "user" ? s.profiles.find((p) => p.user_id === me.id) ?? null : null;
    const currentRegistration = currentProfile ? s.registrations.find((r) => r.participant_id === currentProfile.id) ?? null : null;
    const currentTicket = currentRegistration ? s.tickets.find((t) => t.registration_id === currentRegistration.id) ?? null : null;
    return {
      loading, currentUser, currentProfile, currentRegistration, currentTicket,
      role: me?.role ?? null, isAuthenticated: !!me, permissions: me?.permissions ?? [],
      login, logout, sendPasswordReset, refreshAuth: sync,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, me, storeVersion]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
