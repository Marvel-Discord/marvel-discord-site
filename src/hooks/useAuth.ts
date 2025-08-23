import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, signOut as apiSignOut } from "@/api/polls/auth";
import { queryKeys } from "@/lib/queryKeys";
import type { DiscordUserProfile } from "@jocasta-polls-api";

export function useAuth() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: getUser,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (user not authenticated)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiSignOut,
    onSuccess: () => {
      // Clear the user data from cache
      queryClient.setQueryData(queryKeys.auth.user(), null);
      // Invalidate all queries that depend on authentication
      queryClient.invalidateQueries({ queryKey: queryKeys.votes.all });
    },
    onError: (error) => {
      console.error("Sign out error:", error);
    },
  });
}

// Hook to get the current user data without triggering a refetch
export function useAuthData(): DiscordUserProfile | null | undefined {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(queryKeys.auth.user());
}
