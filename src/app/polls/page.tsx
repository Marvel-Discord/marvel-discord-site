"use client";

import { EditState, FilterState } from "@/types/states";
import { FixedPositionContainer } from "@/components/polls/fixedPositionContainer";
import { Flex } from "@radix-ui/themes";
import {
  NewPollButton,
  PollCard,
  PollCardSkeleton,
} from "@/components/polls/poll";
import { PollSearchType, updateUrlParameters } from "@/utils";
import { PollsSearch } from "@/components/polls/search";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useDebounce } from "@/utils/debouncer";
import { useRouter, useSearchParams } from "next/navigation";
import { useTagContext } from "@/contexts/TagContext";
import { usePolls, usePoll } from "@/hooks/usePolls";
import { useGuildsFormatted } from "@/hooks/useGuilds";
import { useUserVotesFormatted, useVote } from "@/hooks/useVotes";
import EditButton from "@/components/polls/editButton";
import InfiniteScroll from "react-infinite-scroll-component";
import ScrollToTopButton from "@/components/polls/scrollToTop";
import styled from "styled-components";
import type { Poll } from "@jocasta-polls-api";
import { emptyPoll } from "@/utils/polls/emptyPoll";

const BodyContainer = styled(Flex).attrs({
  direction: "column",
  gap: "4",
  align: "center",
  justify: "center",
})``;

const FullWidthScroll = styled.div`
  width: 100%;
`;

const PollCardContainer = styled(Flex).attrs({
  direction: "column",
  gap: "4",
  align: "center",
  justify: "center",
})`
  width: 100%;
`;

const LoadingText = styled.h4`
  color: var(--gray-a11);
  font-size: var(--font-size-3);
  font-weight: 500;
  width: 100%;
  text-align: center;
  padding-block: 1rem;
`;

interface EditedPoll {
  poll: Poll;
  state: EditState;
}

export default function PollsHome() {
  const skeletons = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
        <PollCardSkeleton key={index} />
      )),
    []
  );

  return (
    <Suspense
      fallback={
        <BodyContainer>
          <PollsSearch
            handleSearch={() => {}}
            handleTagSelect={() => {}}
            disabled
          />

          <FullWidthScroll>
            <PollCardContainer>{skeletons}</PollCardContainer>
          </FullWidthScroll>
        </BodyContainer>
      }
    >
      <PollsContent skeletons={skeletons} />
    </Suspense>
  );
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

function PollsContent({ skeletons }: { skeletons?: React.ReactNode[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { tags } = useTagContext();
  const { guilds } = useGuildsFormatted();
  const { user } = useAuthContext();
  const { userVotes } = useUserVotesFormatted(user?.id);
  
  const voteMutation = useVote();

  const [editablePolls, setEditablePolls] = useState<Poll[]>([]);
  const [editedPolls, setEditedPolls] = useState<EditedPoll[]>([]);

  const canEdit = user?.isManager ?? false;
  const [editModeEnabled, setEditModeEnabled] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get("search") || ""
  );
  const [searchType, setSearchType] = useState<PollSearchType>(
    PollSearchType.SEARCH
  );
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

  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Build user filter for polls query
  const userFilter = useMemo(() => {
    if (!user || filterStateHasVoted(filterState) === undefined) {
      return undefined;
    }
    return {
      userId: BigInt(user.id),
      notVoted: !filterStateHasVoted(filterState),
    };
  }, [user, filterState]);

  // Use polls query for search mode
  const pollsQuery = usePolls({
    search: searchType === PollSearchType.SEARCH ? debouncedSearchValue : undefined,
    tag: selectedTag ?? undefined,
    user: userFilter,
    published: filterState !== FilterState.UNPUBLISHED,
    enabled: searchType === PollSearchType.SEARCH,
  });

  // Use single poll query for ID mode
  const pollQuery = usePoll(
    searchType === PollSearchType.ID ? debouncedSearchValue : "",
    searchType === PollSearchType.ID && !!debouncedSearchValue
  );

  // Flatten polls from infinite query
  const polls = useMemo(() => {
    if (searchType === PollSearchType.ID) {
      return pollQuery.data ? [pollQuery.data] : [];
    }
    return pollsQuery.data?.pages.flatMap(page => page.polls) ?? [];
  }, [pollsQuery.data, pollQuery.data, searchType]);

  const meta = pollsQuery.data?.pages?.[pollsQuery.data.pages.length - 1]?.meta;
  const isLoading = searchType === PollSearchType.SEARCH ? pollsQuery.isFetching : pollQuery.isFetching;

  useEffect(() => {
    setEditModeEnabled(false);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only needs to update when polls or edit mode changes
  useEffect(() => {
    if (!editModeEnabled) {
      setEditedPolls([]);
      setEditablePolls([]);
      return;
    }

    const newPolls = polls.filter(
      (poll) =>
        !editedPolls.some((editablePoll) => editablePoll.poll.id === poll.id)
    );

    const newEditablePolls = [
      ...editedPolls.map((editablePoll) => editablePoll.poll),
      ...newPolls,
    ];
    setEditablePolls(newEditablePolls);
  }, [editModeEnabled, polls, editedPolls]);

  const handleSearch = (value: string, newSearchType?: PollSearchType) => {
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
    updateUrlParameters(router, searchParams, {
      search: fullValue !== "" ? fullValue : null,
    });
  };

  const handleTagSelect = (value: string) => {
    setSelectedTag(value === "all" ? null : Number(value));
    updateUrlParameters(router, searchParams, {
      tag: value === "all" ? null : Number(value),
    });
  };

  useEffect(() => {
    const hasVoted = filterStateHasVoted(filterState);
    updateUrlParameters(router, searchParams, {
      hasVoted: hasVoted !== undefined ? hasVoted : null,
    });
  }, [filterState, router, searchParams]);

  const setUserVote = (pollId: number, choice: number | undefined) => {
    if (!user) return;
    
    voteMutation.mutate({
      pollId,
      userId: user.id,
      choiceId: choice,
    });
  };

  const handleEditChange = (poll: Poll, state: EditState) => {
    setEditedPolls((prev) => {
      const alreadyEdited = prev.find((p) => p.poll.id === poll.id);
      if (state === EditState.NONE) {
        return alreadyEdited ? prev.filter((p) => p.poll.id !== poll.id) : prev;
      }
      if (!alreadyEdited) {
        if (state === EditState.DELETE && poll.id === 0) {
          setEditablePolls((prev) => prev.filter((p) => p.id !== poll.id));
          return prev.filter((p) => p.poll.id !== poll.id);
        }
        return [...prev, { poll, state }];
      }
      return prev;
    });
  };

  const dataExists =
    polls &&
    tags &&
    guilds &&
    Object.keys(tags).length > 0 &&
    Object.keys(guilds).length > 0;

  const displayedPolls = !editModeEnabled ? polls : editablePolls;

  const tallyPollsCreated = useMemo(
    () =>
      editedPolls.filter((editedPoll) => editedPoll.state === EditState.CREATE),
    [editedPolls]
  );
  const tallyPollsUpdated = useMemo(
    () =>
      editedPolls.filter((editedPoll) => editedPoll.state === EditState.UPDATE),
    [editedPolls]
  );
  const tallyPollsDeleted = useMemo(
    () =>
      editedPolls.filter((editedPoll) => editedPoll.state === EditState.DELETE),
    [editedPolls]
  );
  const formatCount = (count: number, label: string) =>
    count > 0 ? `${count} poll${count === 1 ? "" : "s"} ${label}` : null;

  return (
    <>
      <FixedPositionContainer>
        <ScrollToTopButton />
        {canEdit && (
          <EditButton
            editModeEnabled={editModeEnabled}
            setEditModeEnabled={setEditModeEnabled}
            hasChanges={editedPolls.length > 0}
            text={
              editedPolls.length > 0
                ? [
                    formatCount(tallyPollsCreated.length, "created"),
                    formatCount(tallyPollsUpdated.length, "updated"),
                    formatCount(tallyPollsDeleted.length, "deleted"),
                  ]
                    .filter(Boolean)
                    .join(", ")
                : undefined
            }
          />
        )}
      </FixedPositionContainer>
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

        <FullWidthScroll>
          {dataExists && !isLoading ? (
            <InfiniteScroll
              dataLength={polls.length}
              next={() => {
                if (searchType === PollSearchType.SEARCH && pollsQuery.hasNextPage) {
                  pollsQuery.fetchNextPage();
                }
              }}
              hasMore={searchType === PollSearchType.SEARCH ? pollsQuery.hasNextPage ?? false : false}
              loader={<LoadingText>Loading...</LoadingText>}
              style={{
                overflow: "visible",
              }}
            >
              <PollCardContainer>
                {displayedPolls.length === 0 ? (
                  <p>No search results found</p>
                ) : (
                  <>
                    {editModeEnabled && (
                      <NewPollButton
                        onClick={() => {
                          setEditablePolls((prev) => [emptyPoll(), ...prev]);
                        }}
                      />
                    )}
                    {displayedPolls.map((poll) => (
                      <PollCard
                        key={poll.id}
                        poll={poll}
                        tag={tags[Number(poll.tag)]}
                        guild={guilds[poll.guild_id.toString()]}
                        userVote={userVotes[poll.id]}
                        setUserVote={(choice) =>
                          !editModeEnabled
                            ? setUserVote(poll.id, choice)
                            : undefined
                        }
                        editable={
                          editModeEnabled &&
                          poll.guild_id.toString() === "281648235557421056"
                        }
                        updatePoll={handleEditChange}
                      />
                    ))}
                  </>
                )}
              </PollCardContainer>
            </InfiniteScroll>
          ) : (
            <PollCardContainer>
              {searchType === PollSearchType.ID
                ? Array.isArray(skeletons)
                  ? skeletons.slice(0, 1)
                  : []
                : skeletons}
            </PollCardContainer>
          )}
        </FullWidthScroll>
      </BodyContainer>
    </>
  );
}
