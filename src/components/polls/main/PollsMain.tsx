import React, { useEffect, useCallback } from "react";
import { Flex } from "@radix-ui/themes";
import { useAuthContext } from "@/contexts/AuthProvider";
import { usePollRefetch } from "@/contexts/PollRefetchContext";
import { useDebounce } from "@/utils/debouncer";
import { usePolls } from "@/hooks/usePolls";
import { usePollSearch } from "@/hooks/usePollSearch";
import { PollsHeader } from "../layout/PollsHeader";
import { PollList } from "./PollList";
import { PollsSearch } from "../forms/search";
import styled from "styled-components";
import type { Poll } from "@jocasta-polls-api";

const BodyContainer = styled(Flex).attrs({
  direction: "column",
  gap: "4",
  align: "center",
  justify: "center",
})`
  margin-bottom: 2rem;
`;

interface PollsMainProps {
  skeletons?: React.ReactNode[];
  polls: Poll[];
  setPolls: (polls: Poll[] | ((prev: Poll[]) => Poll[])) => void;
}

export function PollsMain({ skeletons, polls, setPolls }: PollsMainProps) {
  const { user } = useAuthContext();
  const { registerRefetch } = usePollRefetch();
  const {
    polls: fetchedPolls,
    meta,
    loading,
    setLoading,
    page,
    setPage,
    fetchPolls,
  } = usePolls();

  const {
    searchValue,
    searchType,
    selectedTag,
    filterState,
    setFilterState,
    handleSearch,
    handleTagSelect,
  } = usePollSearch();

  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Create a refetch function that resets polls and triggers a fresh fetch
  const handleRefetch = useCallback(async () => {
    setPolls([]);
    setPage(1);

    // Trigger a fresh fetch with current search parameters
    const controller = new AbortController();

    await fetchPolls({
      searchValue: debouncedSearchValue,
      searchType,
      selectedTag,
      filterState,
      user,
      controller,
      resetPage: true,
    });
  }, [
    debouncedSearchValue,
    searchType,
    selectedTag,
    filterState,
    user,
    fetchPolls,
    setPolls,
    setPage,
  ]);

  // Register the refetch function with the context
  useEffect(() => {
    registerRefetch(handleRefetch);
  }, [registerRefetch, handleRefetch]);

  // Sync fetched polls with parent state
  useEffect(() => {
    setPolls(fetchedPolls);
  }, [fetchedPolls, setPolls]);

  // Initial search on component mount
  useEffect(() => {
    handleSearch(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page and show skeletons when search parameters change
  useEffect(() => {
    setPage(1);
    setPolls([]);
    setLoading(true); // Show skeletons immediately on new search
  }, [debouncedSearchValue, selectedTag, filterState, setPage, setPolls, setLoading]);

  // Fetch polls when search parameters change
  useEffect(() => {
    const controller = new AbortController();

    const performSearch = async () => {
      if (page === 1 && polls.length === 0) {
        setLoading(true);
      }

      const cleanup = await fetchPolls({
        searchValue: debouncedSearchValue,
        searchType,
        selectedTag,
        filterState,
        user,
        controller,
        resetPage: page === 1,
      });

      return cleanup;
    };

    const cleanup = performSearch();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
      controller.abort();
    };
  }, [
    debouncedSearchValue,
    selectedTag,
    filterState,
    user,
    searchType,
    fetchPolls,
    page,
    setLoading,
  ]);

  const handleLoadMore = useCallback(async () => {
    if (meta?.nextPage) {
      setPage(meta.nextPage);
    }
  }, [meta, setPage]);

  return (
    <>
      <PollsHeader />
      <BodyContainer>
        <PollsSearch
          handleSearch={handleSearch}
          handleTagSelect={handleTagSelect}
          searchValue={searchValue}
          meta={meta}
          selectedTag={selectedTag}
          filterState={filterState}
          setFilterState={setFilterState}
          searchType={searchType}
          user={user}
        />

        <PollList
          polls={polls}
          loading={loading}
          meta={meta}
          onLoadMore={handleLoadMore}
          searchType={searchType}
          skeletons={skeletons}
        />
      </BodyContainer>
    </>
  );
}
