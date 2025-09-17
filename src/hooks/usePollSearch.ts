import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterState, SortOrder } from "@/types/states";
import { PollSearchType, updateUrlParameters } from "@/utils";
import { usePollsSearchContext } from "@/contexts/SearchContext";

export function usePollSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pollsContext = usePollsSearchContext();

  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get("search") || ""
  );
  const [searchType, setSearchType] = useState<PollSearchType>(() => {
    const typeParam = searchParams.get("type");
    return Object.values(PollSearchType).includes(typeParam as PollSearchType)
      ? (typeParam as PollSearchType)
      : PollSearchType.SEARCH;
  });
  const [selectedTag, setSelectedTag] = useState<number | null>(
    Number(searchParams.get("tag")) || null
  );

  const searchParamHasVoted = searchParams.get("hasVoted");
  const [filterState, setFilterState] = useState<FilterState>(
    searchParamHasVoted === "true"
      ? FilterState.HAS_VOTED
      : searchParamHasVoted === "false"
      ? FilterState.NOT_VOTED
      : FilterState.ALL
  );

  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    const sortParam = searchParams.get("order");
    return Object.values(SortOrder).includes(sortParam as SortOrder)
      ? (sortParam as SortOrder)
      : SortOrder.NEWEST;
  });

  const handleSearch = useCallback(
    (value: string, newSearchType?: PollSearchType) => {
      if (newSearchType !== undefined) {
        setSearchType(newSearchType);
      }

      if (
        value.toLowerCase().startsWith("id:") &&
        searchType === PollSearchType.SEARCH
      ) {
        setSearchType(PollSearchType.ID);
        setSearchValue(value.substring(3).trim());
      } else {
        setSearchValue(value);
      }

      const fullValue = (
        (newSearchType || searchType) === PollSearchType.ID
          ? `id: ${value}`
          : value
      ).trim();

      const typeToSet = newSearchType || searchType;
      updateUrlParameters(router, searchParams, {
        search: fullValue !== "" ? fullValue : null,
        type: typeToSet === PollSearchType.SEARCH ? null : typeToSet,
      });
    },
    [router, searchParams, searchType]
  );

  const handleTagSelect = useCallback(
    (value: string) => {
      setSelectedTag(value === "all" ? null : Number(value));
      updateUrlParameters(router, searchParams, {
        tag: value === "all" ? null : Number(value),
      });
    },
    [router, searchParams]
  );

  const updateFilterState = useCallback(
    (newFilterState: FilterState) => {
      setFilterState(newFilterState);

      const hasVoted =
        newFilterState === FilterState.HAS_VOTED
          ? true
          : newFilterState === FilterState.NOT_VOTED
          ? false
          : undefined;

      updateUrlParameters(router, searchParams, {
        hasVoted: hasVoted !== undefined ? hasVoted : null,
      });
    },
    [router, searchParams]
  );

  const updateSortOrder = useCallback(
    (newSortOrder: SortOrder) => {
      setSortOrder(newSortOrder);
      updateUrlParameters(router, searchParams, {
        order: newSortOrder === SortOrder.NEWEST ? null : newSortOrder,
      });
    },
    [router, searchParams]
  );

  // Programmatic search function that sets search value and triggers search
  const setSearchToUser = useCallback(
    (username: string) => {
      setSearchValue(username);
      setSearchType(PollSearchType.SEARCH);
      handleSearch(username, PollSearchType.SEARCH);
    },
    [handleSearch]
  );

  // Sync with context when it changes
  useEffect(() => {
    if (pollsContext._triggerSearch) {
      setSearchValue(pollsContext.searchValue);
      setSearchType(pollsContext.searchType);
      handleSearch(pollsContext.searchValue, pollsContext.searchType);
      pollsContext._setTriggerSearch(false);
    }
  }, [
    pollsContext._triggerSearch,
    pollsContext.searchValue,
    pollsContext.searchType,
    handleSearch,
    pollsContext._setTriggerSearch,
  ]);

  return {
    searchValue,
    setSearchValue,
    searchType,
    setSearchType,
    selectedTag,
    setSelectedTag,
    filterState,
    setFilterState: updateFilterState,
    sortOrder,
    setSortOrder: updateSortOrder,
    handleSearch,
    handleTagSelect,
    setSearchToUser, // New programmatic method
  };
}
