import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPolls, getPollById, type PollFilterUser } from "@/api/polls/polls";
import { queryKeys } from "@/lib/queryKeys";

interface UsePollsParams {
  guildId?: string | bigint;
  published?: boolean;
  tag?: number;
  user?: PollFilterUser;
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export function usePolls({
  guildId = "281648235557421056",
  published = true,
  tag,
  user,
  search,
  limit = 10,
  enabled = true,
}: UsePollsParams = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.polls.list({
      guildId,
      published,
      tag,
      userId: user?.userId,
      notVoted: user?.notVoted,
      search,
      limit,
    }),
    queryFn: async ({ pageParam = 1, signal }) => {
      return await getPolls({
        guildId,
        published,
        tag,
        user,
        search,
        page: pageParam,
        limit,
        signal,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
}

// Hook for fetching a single poll by ID
export function usePoll(pollId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.polls.detail(pollId),
    queryFn: () => getPollById(pollId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!pollId,
  });
}
