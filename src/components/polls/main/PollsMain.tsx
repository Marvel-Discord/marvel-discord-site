import React, { useEffect, useCallback } from "react";
import { Flex } from "@radix-ui/themes";
import { useAuthContext } from "@/contexts/AuthProvider";
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
})``;

interface PollsMainProps {
  skeletons?: React.ReactNode[];
  polls: Poll[];
  setPolls: (polls: Poll[] | ((prev: Poll[]) => Poll[])) => void;
}

export function PollsMain({ skeletons, polls, setPolls }: PollsMainProps) {
  const { user } = useAuthContext();
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

  // Sync fetched polls with parent state
  useEffect(() => {
    setPolls(fetchedPolls);
  }, [fetchedPolls, setPolls]);

  // Initial search on component mount
  useEffect(() => {
    handleSearch(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page when search parameters change
  useEffect(() => {
    setPage(1);
    setPolls([]);
  }, [debouncedSearchValue, selectedTag, filterState, setPage, setPolls]);

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
    polls.length,
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
