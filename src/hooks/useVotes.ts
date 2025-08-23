import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserVotes, postVote } from "@/api/polls/votes";
import { queryKeys } from "@/lib/queryKeys";
import { useMemo } from "react";

export function useUserVotes(userId?: string) {
  return useQuery({
    queryKey: queryKeys.votes.userVotes(userId!),
    queryFn: () => getUserVotes(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to get user votes in a more convenient format (Record)
export function useUserVotesFormatted(userId?: string) {
  const { data: votes, ...queryResult } = useUserVotes(userId);

  const formattedVotes = useMemo(() => {
    if (!votes) {
      return {} as Record<number, number>;
    }

    return Object.fromEntries(votes.map((vote) => [vote.poll_id, vote.choice]));
  }, [votes]);

  return {
    userVotes: formattedVotes,
    ...queryResult,
    data: votes,
  };
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pollId,
      userId,
      choiceId,
    }: {
      pollId: number;
      userId: string;
      choiceId?: number;
    }) => postVote(pollId, userId, choiceId),
    onSuccess: (data, { userId }) => {
      // Invalidate user votes to refetch them
      queryClient.invalidateQueries({
        queryKey: queryKeys.votes.userVotes(userId),
      });

      // Also invalidate polls queries as vote counts might have changed
      queryClient.invalidateQueries({
        queryKey: queryKeys.polls.all,
      });
    },
    onError: (error) => {
      console.error("Vote submission error:", error);
    },
  });
}
