import { useState, useCallback } from "react";
import { getPolls, getPollById } from "@/api/polls/polls";
import { PollSearchType } from "@/utils";
import { FilterState } from "@/types/states";
import type { Poll, Meta } from "@jocasta-polls-api";
import axios from "axios";
import { createLogger } from "@/utils/logger";

const logger = createLogger("usePolls");

export interface UsePollsParams {
  search?: string;
  page: number;
  tag?: number;
  signal?: AbortSignal;
  user?: {
    userId: bigint;
    notVoted: boolean;
  };
  published?: boolean;
}

function filterStateHasVoted(filterState: FilterState): boolean | undefined {
  if (filterState === FilterState.HAS_VOTED) {
    return true;
  }
  if (filterState === FilterState.NOT_VOTED) {
    return false;
  }
  return undefined;
}

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);

  const fetchPolls = useCallback(
    async (params: {
      searchValue: string;
      searchType: PollSearchType;
      selectedTag: number | null;
      filterState: FilterState;
      user: { id: string } | null;
      controller: AbortController;
      resetPage?: boolean;
    }) => {
      const {
        searchValue,
        searchType,
        selectedTag,
        filterState,
        user,
        controller,
        resetPage = false,
      } = params;

      let cancelled = false;

      try {
        if (searchType === PollSearchType.SEARCH) {
          const currentPage = resetPage ? 1 : page;
          const { polls: newPolls, meta: newMeta } = await getPolls({
            search: searchValue,
            page: currentPage,
            tag: selectedTag ?? undefined,
            signal: controller.signal,
            user:
              user && filterStateHasVoted(filterState) !== undefined
                ? {
                    userId: BigInt(user.id),
                    notVoted: !filterStateHasVoted(filterState),
                  }
                : undefined,
            published: filterState !== FilterState.UNPUBLISHED,
          });

          if (!cancelled) {
            if (resetPage) {
              setPolls(newPolls);
              setPage(1);
            } else {
              setPolls((prevPolls) => [...prevPolls, ...newPolls]);
            }
            setMeta(newMeta);
          }
        } else {
          try {
            const poll = await getPollById(searchValue);
            if (!cancelled) {
              setPolls([poll]);
            }
          } catch {
            if (!cancelled) {
              setPolls([]);
            }
          } finally {
            setMeta(null);
          }
        }
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) {
          logger.error("Request canceled:", err.message);
        } else {
          logger.error("Request failed:", err);
        }
      }

      return () => {
        cancelled = true;
      };
    },
    [page]
  );

  const resetPolls = useCallback(() => {
    setPolls([]);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (meta?.nextPage) {
      setPage(meta.nextPage);
    }
  }, [meta]);

  return {
    polls,
    setPolls,
    meta,
    loading,
    setLoading,
    page,
    setPage,
    fetchPolls,
    resetPolls,
    loadMore,
  };
}
