import { useAuth, useSignOut } from "@/hooks/useAuth";
import type { DiscordUserProfile } from "@jocasta-polls-api";
import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: DiscordUserProfile | null | undefined;
  refetch: () => void;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  refetch: () => {},
  signOut: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useAuth();
  const signOutMutation = useSignOut();

  const handleSignOut = useCallback(() => {
    signOutMutation.mutate();
  }, [signOutMutation]);

  const value = useMemo(
    () => ({
      user: user === undefined ? null : user,
      refetch,
      signOut: handleSignOut,
      loading: isLoading || signOutMutation.isPending,
    }),
    [user, refetch, handleSignOut, isLoading, signOutMutation.isPending]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
