import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref to prevent onAuthStateChange from triggering premature state updates/redirects during strict login checks
  const isLoggingInRef = useRef(false);

  // Pure helper: Resolve profile and role without mutating context state
  const resolveProfileAndRole = useCallback(async (authUser) => {
    if (!authUser) return null;

    const metaRole = authUser.user_metadata?.role;

    // 1. If user signed up / is registered as department
    if (metaRole === "department") {
      try {
        const { data: dp } = await supabase
          .from("department_profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        const deptProfile = dp || {
          id: authUser.id,
          dept_name: authUser.user_metadata?.dept_name || "Department Official",
          dept_code: authUser.user_metadata?.dept_code || "OFFICIAL",
          role: "department",
        };

        return { profile: deptProfile, role: "department" };
      } catch {
        const fallbackProfile = {
          id: authUser.id,
          dept_name: authUser.user_metadata?.dept_name || "Department Official",
          dept_code: authUser.user_metadata?.dept_code || "OFFICIAL",
          role: "department",
        };
        return { profile: fallbackProfile, role: "department" };
      }
    }

    // 2. If user signed up as citizen (user)
    if (metaRole === "user") {
      try {
        const { data: up } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        const userProfile = up || {
          id: authUser.id,
          name: authUser.user_metadata?.name || "Citizen",
          phone: authUser.user_metadata?.phone || null,
          role: "user",
        };

        return { profile: userProfile, role: "user" };
      } catch {
        const fallbackProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.name || "Citizen",
          phone: authUser.user_metadata?.phone || null,
          role: "user",
        };
        return { profile: fallbackProfile, role: "user" };
      }
    }

    // 3. Fallback: check department_profiles first, then user_profiles
    try {
      const { data: dp } = await supabase
        .from("department_profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();
      if (dp) {
        return { profile: dp, role: "department" };
      }
    } catch {}

    try {
      const { data: up } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();
      if (up) {
        return { profile: up, role: "user" };
      }
    } catch {}

    const defaultRole = metaRole || "user";
    return { profile: authUser.user_metadata || null, role: defaultRole };
  }, []);

  // Fetch profile and update context state
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      setRole(null);
      try { localStorage.removeItem("civic_role"); } catch {}
      return null;
    }

    const res = await resolveProfileAndRole(authUser);
    if (res) {
      setProfile(res.profile);
      setRole(res.role);
      try { localStorage.setItem("civic_role", res.role); } catch {}
    }
    return res;
  }, [resolveProfileAndRole]);

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const authUser = session?.user ?? null;
      if (authUser) {
        const res = await resolveProfileAndRole(authUser);
        if (res) {
          setUser(authUser);
          setProfile(res.profile);
          setRole(res.role);
          try { localStorage.setItem("civic_role", res.role); } catch {}
        } else {
          setUser(authUser);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
        try { localStorage.removeItem("civic_role"); } catch {}
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // If login() is actively verifying expected role, don't interfere
        if (isLoggingInRef.current) return;

        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setProfile(null);
          setRole(null);
          try { localStorage.removeItem("civic_role"); } catch {}
          setLoading(false);
          return;
        }

        const authUser = session?.user ?? null;
        if (authUser) {
          const res = await resolveProfileAndRole(authUser);
          setUser(authUser);
          if (res) {
            setProfile(res.profile);
            setRole(res.role);
            try { localStorage.setItem("civic_role", res.role); } catch {}
          }
        }
        setLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, [resolveProfileAndRole]);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async (formData, selectedRole) => {
    const { email, password, ...rest } = formData;

    // Generate a unique 6-character alphanumeric recovery code (e.g. A7K2M9)
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const recoveryCode = Array.from({ length: 6 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: rest.name || "",
          phone: rest.phone || null,
          role: selectedRole,
          dept_name: rest.deptName || "",
          dept_code: rest.deptCode || "",
          recovery_code: recoveryCode,
        },
      },
    });
    if (error) throw error;

    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }

    const uid = data.user?.id;
    if (!uid) throw new Error("Sign-up failed — no user ID returned.");

    if (selectedRole === "user") {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: uid,
          name: rest.name,
          phone: rest.phone || null,
          role: "user",
          recovery_code: recoveryCode,
        });
      if (profileError) throw profileError;
    } else {
      const { error: profileError } = await supabase
        .from("department_profiles")
        .upsert({
          id: uid,
          dept_name: rest.deptName,
          dept_code: rest.deptCode,
          role: "department",
          recovery_code: recoveryCode,
        });
      if (profileError) throw profileError;
    }

    return { data, recoveryCode };
  }, []);

  // ── Login with Strict Role Enforcement ────────────────────────────────────
  const login = useCallback(async (email, password, expectedRole) => {
    isLoggingInRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const authUser = data.user;
      const res = await resolveProfileAndRole(authUser);
      const actualRole = res?.role || authUser?.user_metadata?.role || "user";

      // Strict role check: enforce tab matching
      if (expectedRole && actualRole !== expectedRole) {
        // Force sign out immediately to prevent session persistence
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setRole(null);
        try { localStorage.removeItem("civic_role"); } catch {}

        if (expectedRole === "department") {
          throw new Error("Access Denied: This account is registered as a Citizen. Please switch to the Citizen tab to sign in.");
        } else {
          throw new Error("Access Denied: This account is registered as a Department Official. Please switch to the Department tab to sign in.");
        }
      }

      // Valid role - apply state
      setUser(authUser);
      if (res) {
        setProfile(res.profile);
        setRole(res.role);
        try { localStorage.setItem("civic_role", res.role); } catch {}
      }
      return actualRole;
    } finally {
      isLoggingInRef.current = false;
    }
  }, [resolveProfileAndRole]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
    try { localStorage.removeItem("civic_role"); } catch {}
  }, []);

  // ── Reset Password using Recovery Code ───────────────────────────────────
  const resetPasswordWithCode = useCallback(async (email, recoveryCode, newPassword) => {
    const { data, error } = await supabase.rpc("reset_password_with_recovery_code", {
      user_email:    email,
      recovery_code: recoveryCode,
      new_password:  newPassword,
    });
    if (error) throw error;
    if (!data?.success) throw new Error(data?.message || "Invalid recovery code.");
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, profile, role, loading,
      signUp, login, logout,
      resetPasswordWithCode,
      fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
