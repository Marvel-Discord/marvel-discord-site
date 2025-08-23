"use client";

import { FilterState } from "@/types/states";
import { FixedPositionContainer } from "@/components/polls/fixedPositionContainer";
import { Flex } from "@radix-ui/themes";
import { getGuilds } from "@/api/polls/guilds";
import { getPollById, getPolls } from "@/api/polls/polls";
import { getUserVotes } from "@/api/polls/votes";
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
import { EditProvider, useEditContext } from "@/contexts/EditContext";
import axios from "axios";
import EditButton from "@/components/polls/editButton";
import InfiniteScroll from "react-infinite-scroll-component";
import ScrollToTopButton from "@/components/polls/scrollToTop";
import styled from "styled-components";
import type { Meta, Poll, PollInfo } from "@jocasta-polls-api";

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
  const { user } = useAuthContext();
  const canEdit = user?.isManager ?? false;

  const [polls, setPolls] = useState<Poll[]>([]);

  return (
    <EditProvider polls={polls} canEdit={canEdit}>
      <PollsContentInner
        skeletons={skeletons}
        polls={polls}
        setPolls={setPolls}
      />
    </EditProvider>
  );
}

function PollsContentInner({
  skeletons,
  polls,
  setPolls,
}: {
  skeletons?: React.ReactNode[];
  polls: Poll[];
  setPolls: (polls: Poll[] | ((prev: Poll[]) => Poll[])) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();
  const { tags } = useTagContext();
  const {
    editModeEnabled,
    setEditModeEnabled,
    editablePolls,
    handleEditChange,
    addNewPoll,
    hasChanges,
    canSave,
    changesSummary,
    validationResult,
    isPollEditable,
  } = useEditContext();

  const [meta, setMeta] = useState<Meta | null>(null);
  const [guilds, setGuilds] = useState<Record<string, PollInfo>>({});
  const [userVotes, setUserVotes] = useState<Record<number, number>>({});

  const canEdit = user?.isManager ?? false;

  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get("search") || ""
  );
  const [searchType, setSearchType] = useState<PollSearchType>(
    PollSearchType.SEARCH
  );
  const [page, setPage] = useState<number>(1);
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

  const [loading, setLoading] = useState<boolean>(false);

  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    const controller = new AbortController();

    let cancelled = false;

    const fetchPolls = async () => {
      try {
        if (searchType === PollSearchType.SEARCH) {
          const { polls, meta } = await getPolls({
            search: debouncedSearchValue,
            page,
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
            setPolls((prevPolls) => [...prevPolls, ...polls]);
            setMeta(meta);
            setPage(meta.page);
          }
        } else {
          try {
            const poll = await getPollById(debouncedSearchValue);
            if (!cancelled) {
              setPolls([poll]);
            }
          } catch {
            setPolls([]);
          } finally {
            setMeta(null);
          }
        }
        setLoading(false);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } else {
          console.error(err);
        }
      }
    };

    if (page === 1) {
      setLoading(true);
    }
    fetchPolls();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedSearchValue, page, selectedTag, filterState, user, searchType]);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await getGuilds();
        const guilds: Record<string, PollInfo> = Object.fromEntries(
          response.map((guild) => [guild.guild_id, guild])
        );
        setGuilds(guilds);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGuilds();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Just on start
  useEffect(() => {
    handleSearch(searchValue);
  }, []);

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!user) {
        setUserVotes({});
        return;
      }
      try {
        const response = await getUserVotes(user.id);
        const userVotes: Record<number, number> = Object.fromEntries(
          response.map((vote) => [vote.poll_id, vote.choice])
        );
        setUserVotes(userVotes);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserVotes();
  }, [user]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset whenever they change
  useEffect(() => {
    setPage(1);
    setPolls([]);
  }, [debouncedSearchValue, selectedTag, filterState]);

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

  function setUserVote(pollId: number, choice: number | undefined) {
    if (choice === undefined) {
      setUserVotes((prevVotes) => {
        const newVotes = { ...prevVotes };
        delete newVotes[pollId];
        return newVotes;
      });
      return;
    }
    setUserVotes((prevVotes) => ({
      ...prevVotes,
      [pollId]: choice,
    }));
  }

  const dataExists =
    polls &&
    tags &&
    guilds &&
    Object.keys(tags).length > 0 &&
    Object.keys(guilds).length > 0;

  const displayedPolls = !editModeEnabled ? polls : editablePolls;

  return (
    <>
      <FixedPositionContainer>
        <ScrollToTopButton />
        {canEdit && (
          <EditButton
            editModeEnabled={editModeEnabled}
            setEditModeEnabled={setEditModeEnabled}
            hasChanges={hasChanges}
            canSave={canSave}
            validationErrors={validationResult.errors}
            text={changesSummary}
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
          {dataExists && !loading ? (
            <InfiniteScroll
              dataLength={polls.length}
              next={async () => {
                if (meta?.nextPage) {
                  setPage(meta.nextPage);
                }
              }}
              hasMore={meta ? meta.page < meta.totalPages : false}
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
                    {editModeEnabled && <NewPollButton onClick={addNewPoll} />}
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
                        editable={isPollEditable(poll)}
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
