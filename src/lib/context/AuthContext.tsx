"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, ParticipantProfile, Registration, Ticket, UserRole, CoordinatorPermission } from "../types";
import { loadStore } from "../store";

interface AuthContextType {
  currentUser: User | null;
  currentProfile: ParticipantProfile | null;
  currentRegistration: Registration | null;
  currentTicket: Ticket | null;
  role: UserRole;
  isAuthenticated: boolean;
  permissions: CoordinatorPermission[];
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "p2p_active_auth_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<ParticipantProfile | null>(null);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [role, setRole] = useState<UserRole>("user");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<CoordinatorPermission[]>([]);

  const syncFromStore = (activeEmail?: string, activeRole?: UserRole) => {
    const store = loadStore();
    const targetRole = activeRole || role || "user";
    const targetEmail = activeEmail || currentUser?.email;

    if (targetRole === "admin") {
      const adminUser: User = {
        id: "admin-1",
        auth_id: "auth-admin",
        name: "Dr. S. K. Rao (Admin)",
        email: "admin@nbkrist.org",
        phone: "+91 94400 12345",
        role: "admin",
        status: "active",
        created_at: "2026-09-01T00:00:00Z",
      };
      setCurrentUser(adminUser);
      setRole("admin");
      setIsAuthenticated(true);
      setCurrentProfile(null);
      setCurrentRegistration(null);
      setCurrentTicket(null);
      setPermissions([
        "CHECKIN_VIEW",
        "CHECKIN_MANAGE",
        "PARTICIPANT_VIEW",
        "REGISTRATION_VERIFY",
        "SUPPORT_VIEW",
        "SUPPORT_REPLY",
      ]);
      return;
    }

    if (targetRole === "coordinator") {
      const coord = store.coordinators[0];
      const coordUser: User = {
        id: coord?.user_id || "coord-user-1",
        auth_id: "auth-coord",
        name: coord?.name || "K. V. Chaitanya",
        email: coord?.email || "coordinator@nbkrist.org",
        phone: "+91 94401 56789",
        role: "coordinator",
        status: "active",
        created_at: "2026-09-10T00:00:00Z",
      };
      setCurrentUser(coordUser);
      setRole("coordinator");
      setIsAuthenticated(true);
      setCurrentProfile(null);
      setCurrentRegistration(null);
      setCurrentTicket(null);
      setPermissions(coord?.permissions || []);
      return;
    }

    // Default Participant / User role
    const foundUser = targetEmail
      ? store.users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
      : store.users[0]; // defaults to Manoj

    if (foundUser) {
      const profile = store.profiles.find((p) => p.user_id === foundUser.id) || store.profiles[0];
      const registration = store.registrations.find((r) => r.participant_id === profile?.id) || store.registrations[0];
      const ticket = store.tickets.find((t) => t.registration_id === registration?.id) || store.tickets[0];

      setCurrentUser(foundUser);
      setCurrentProfile(profile || null);
      setCurrentRegistration(registration || null);
      setCurrentTicket(ticket || null);
      setRole("user");
      setIsAuthenticated(true);
      setPermissions([]);
    } else {
      // Guest
      setCurrentUser(null);
      setCurrentProfile(null);
      setCurrentRegistration(null);
      setCurrentTicket(null);
      setRole("user");
      setIsAuthenticated(false);
      setPermissions([]);
    }
  };

  useEffect(() => {
    // Check saved state
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const { email, role: savedRole } = JSON.parse(saved);
        syncFromStore(email, savedRole);
      } else {
        // Auto default to Manoj (participant) for instantaneous showcase preview
        syncFromStore("student@nbkrist.org", "user");
      }
    } catch {
      syncFromStore();
    }

    const handleStoreUpdate = () => {
      syncFromStore();
    };

    window.addEventListener("store_updated", handleStoreUpdate);
    return () => window.removeEventListener("store_updated", handleStoreUpdate);
  }, []);

  const login = (email: string, roleHint: UserRole = "user") => {
    const store = loadStore();
    if (roleHint === "admin" || email.toLowerCase().includes("admin")) {
      quickSwitchRole("admin");
      return true;
    }
    if (roleHint === "coordinator" || email.toLowerCase().includes("coord")) {
      quickSwitchRole("coordinator");
      return true;
    }

    const matchedUser = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      syncFromStore(matchedUser.email, "user");
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: matchedUser.email, role: "user" }));
      return true;
    }

    // If new user email, log them in as a participant
    syncFromStore(email, "user");
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email, role: "user" }));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
    setCurrentRegistration(null);
    setCurrentTicket(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const quickSwitchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "admin") {
      syncFromStore("admin@nbkrist.org", "admin");
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: "admin@nbkrist.org", role: "admin" }));
    } else if (newRole === "coordinator") {
      syncFromStore("coordinator@nbkrist.org", "coordinator");
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: "coordinator@nbkrist.org", role: "coordinator" }));
    } else {
      syncFromStore("student@nbkrist.org", "user");
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: "student@nbkrist.org", role: "user" }));
    }
  };

  const refreshAuth = () => {
    syncFromStore();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentProfile,
        currentRegistration,
        currentTicket,
        role,
        isAuthenticated,
        permissions,
        login,
        logout,
        quickSwitchRole,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
