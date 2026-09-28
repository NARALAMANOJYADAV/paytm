"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, ParticipantProfile, Registration, Ticket, UserRole, CoordinatorPermission } from "../types";
import { loadStore } from "../store";

export interface LoginResponse {
  success: boolean;
  error?: string;
  role?: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  currentProfile: ParticipantProfile | null;
  currentRegistration: Registration | null;
  currentTicket: Ticket | null;
  role: UserRole;
  isAuthenticated: boolean;
  permissions: CoordinatorPermission[];
  login: (identifier: string, password?: string, roleHint?: UserRole) => LoginResponse;
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
        // Guest mode by default: user must explicitly log in or register
        syncFromStore();
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

  const login = (
    identifier: string,
    password?: string,
    roleHint: UserRole = "user"
  ): LoginResponse => {
    const cleanId = (identifier || "").trim();
    const cleanPass = (password || "").trim();

    if (!cleanId) {
      return { success: false, error: "Please enter your ID, email, or roll number." };
    }

    // 1. COORDINATOR LOGIN: COORDINATOR567 | PASS: coordinator@890
    if (
      roleHint === "coordinator" ||
      cleanId.toUpperCase() === "COORDINATOR567" ||
      cleanId.toLowerCase() === "coordinator@nbkrist.org"
    ) {
      if (cleanId.toUpperCase() !== "COORDINATOR567" && cleanId.toLowerCase() !== "coordinator@nbkrist.org") {
        return { success: false, error: "Invalid Coordinator ID. Official ID: COORDINATOR567" };
      }
      if (cleanPass !== "coordinator@890") {
        return { success: false, error: "Incorrect password for Coordinator." };
      }
      syncFromStore("coordinator@nbkrist.org", "coordinator");
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: "coordinator@nbkrist.org", role: "coordinator" }));
      return { success: true, role: "coordinator" };
    }

    // 2. ADMIN LOGIN: ADMIN345 | PASS: admin@678
    if (
      roleHint === "admin" ||
      cleanId.toUpperCase() === "ADMIN345" ||
      cleanId.toLowerCase() === "admin@nbkrist.org"
    ) {
      if (cleanId.toUpperCase() !== "ADMIN345" && cleanId.toLowerCase() !== "admin@nbkrist.org") {
        return { success: false, error: "Invalid Admin ID. Official ID: ADMIN345" };
      }
      if (cleanPass !== "admin@678") {
        return { success: false, error: "Incorrect password for Admin." };
      }
      syncFromStore("admin@nbkrist.org", "admin");
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: "admin@nbkrist.org", role: "admin" }));
      return { success: true, role: "admin" };
    }

    // 3. PARTICIPANT LOGIN: Based on user registration form details
    const store = loadStore();
    const searchId = cleanId.toLowerCase();

    // Match registered email OR roll number
    let matchedUser = store.users.find((u) => u.email.toLowerCase() === searchId);
    let matchedProfile = store.profiles.find((p) => p.roll_number.toLowerCase() === searchId);

    if (!matchedUser && matchedProfile) {
      const prof = matchedProfile;
      matchedUser = store.users.find((u) => u.id === prof.user_id);
    }
    if (matchedUser && !matchedProfile) {
      const usr = matchedUser;
      matchedProfile = store.profiles.find((p) => p.user_id === usr.id);
    }

    if (!matchedUser) {
      return {
        success: false,
        error: "No registered participant found with this Email or Roll Number. Please register via the registration form first.",
      };
    }

    // Verify password set during registration (or default demo password)
    const expectedPassword = matchedUser.password || "password123";
    if (cleanPass && cleanPass !== expectedPassword) {
      return {
        success: false,
        error: "Incorrect password. Please enter the password you created during registration.",
      };
    }

    syncFromStore(matchedUser.email, "user");
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: matchedUser.email, role: "user" }));
    return { success: true, role: "user" };
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
