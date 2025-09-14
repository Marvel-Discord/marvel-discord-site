import { signOut as apiSignOut, getUser } from "@/api/polls/auth";
import type { DiscordUserProfile } from "@jocasta-polls-api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: DiscordUserProfile | null;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  fetchUser: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiscordUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    await getUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signOut = useCallback<AuthContextType["signOut"]>(async () => {
    setLoading(true);
    await apiSignOut().then(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, fetchUser, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
