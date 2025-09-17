import { useState, useCallback } from "react";
import { getPolls, getPollById } from "@/api/polls/polls";
import { PollSearchType } from "@/utils";
import { FilterState, SortOrder } from "@/types/states";
import { mapSortOrderToApiParams } from "@/utils/polls";
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
  const [randomSeed, setRandomSeed] = useState<number | null>(null);
  const [reshuffleCounter, setReshuffleCounter] = useState<number>(0);

  const fetchPolls = useCallback(
    async (params: {
      searchValue: string;
      searchType: PollSearchType;
      selectedTag: number | null;
      filterState: FilterState;
      sortOrder: SortOrder;
      user: { id: string } | null;
      controller: AbortController;
      resetPage?: boolean;
    }) => {
      const {
        searchValue,
        searchType,
        selectedTag,
        filterState,
        sortOrder,
        user,
        controller,
        resetPage = false,
      } = params;

      let cancelled = false;

      try {
        if (searchType === PollSearchType.SEARCH) {
          const currentPage = resetPage ? 1 : page;
          const sortParams = mapSortOrderToApiParams(sortOrder);

          // For random ordering: use existing seed for pagination, clear for new queries
          const seedToUse = resetPage
            ? null
            : sortParams.order === "random"
            ? randomSeed
            : null;

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
            order: sortParams.order,
            orderDir: sortParams.orderDir,
            seed: seedToUse ?? undefined,
          });

          if (!cancelled) {
            // Store the random seed from the response for future pagination
            if (
              newMeta.randomSeed !== undefined &&
              newMeta.randomSeed !== randomSeed
            ) {
              setRandomSeed(newMeta.randomSeed);
            }

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
    setRandomSeed(null); // Clear random seed when resetting
  }, []);

  const loadMore = useCallback(() => {
    if (meta?.nextPage) {
      setPage(meta.nextPage);
    }
  }, [meta]);

  const reshuffle = useCallback(() => {
    setRandomSeed(null); // Clear seed to get a new random order
    setPolls([]);
    setPage(1);
    setReshuffleCounter((prev) => prev + 1); // Trigger re-fetch
  }, []);

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
    reshuffle,
    randomSeed,
    reshuffleCounter,
  };
}
