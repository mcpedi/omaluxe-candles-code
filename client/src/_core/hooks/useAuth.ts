import { getLoginUrl } from "@/const";
import { firebaseAuth, firebasePersistenceReady } from "@/lib/firebase";
import { trpc } from "@/lib/trpc";
import { signOut, type User as FirebaseUser } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const previousUid = useRef<string | null>(firebaseAuth?.currentUser?.uid ?? null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(
    firebaseAuth?.currentUser ?? null
  );
  const [authStateLoading, setAuthStateLoading] = useState(Boolean(firebaseAuth));

  useEffect(() => {
    const auth = firebaseAuth;
    if (!auth) {
      setFirebaseUser(null);
      setAuthStateLoading(false);
      return;
    }
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    void firebasePersistenceReady.then(() => {
      if (disposed) return;
      unsubscribe = auth.onIdTokenChanged((user) => {
        const nextUid = user?.uid ?? null;
        if (previousUid.current !== nextUid) {
          previousUid.current = nextUid;
          queryClient.clear();
        }
        setFirebaseUser(user);
        setAuthStateLoading(false);
      });
    });
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [queryClient]);

  const hasVerifiedSession =
    !authStateLoading && Boolean(firebaseUser?.emailVerified);
  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: hasVerifiedSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!firebaseUser) {
      utils.auth.me.setData(undefined, null);
      return;
    }
    if (firebaseUser.emailVerified) {
      void utils.auth.me.invalidate();
    }
  }, [firebaseUser?.uid, firebaseUser?.emailVerified, utils]);

  const logout = useCallback(async () => {
    if (firebaseAuth) await signOut(firebaseAuth);
    queryClient.clear();
  }, [queryClient]);

  const state = useMemo(() => {
    const user = hasVerifiedSession ? meQuery.data ?? null : null;
    return {
      user,
      loading: authStateLoading || (hasVerifiedSession && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [authStateLoading, hasVerifiedSession, meQuery.data, meQuery.error, meQuery.isLoading]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || state.loading || state.user) return;
    if (typeof window === "undefined" || window.location.pathname === "/login") return;
    window.location.replace(redirectPath);
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
