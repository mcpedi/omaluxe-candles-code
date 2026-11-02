import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setSessionLoading(false);
      return;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setSessionLoading(false);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        window.setTimeout(() => queryClient.clear(), 0);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(error ? null : data.session);
      setSessionLoading(false);
    }).catch(() => {
      if (!active) return;
      setSession(null);
      setSessionLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: Boolean(supabase && session && !sessionLoading),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    } finally {
      setSession(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const user = session ? meQuery.data ?? null : null;
  const loading = sessionLoading || Boolean(session && meQuery.isLoading);

  useEffect(() => {
    if (!redirectOnUnauthenticated || loading || user) return;
    if (typeof window === "undefined" || window.location.pathname === "/login") return;
    window.location.replace(redirectPath);
  }, [redirectOnUnauthenticated, loading, user, redirectPath]);

  return {
    user,
    loading,
    error: meQuery.error ?? null,
    isAuthenticated: Boolean(session && user),
    refresh: () => meQuery.refetch(),
    logout,
  };
}
