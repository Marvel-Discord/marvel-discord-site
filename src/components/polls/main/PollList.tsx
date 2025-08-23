import React from "react";
import { Flex } from "@radix-ui/themes";
import { PollSearchType } from "@/utils";
import { useTagContext } from "@/contexts/TagContext";
import { usePollDataContext } from "@/contexts/PollDataProvider";
import { useEditContext } from "@/contexts/EditContext";
import { NewPollButton, PollCard } from "./poll";
import InfiniteScroll from "react-infinite-scroll-component";
import styled from "styled-components";
import type { Poll, Meta } from "@jocasta-polls-api";

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

interface PollListProps {
  polls: Poll[];
  loading: boolean;
  meta: Meta | null;
  onLoadMore: () => void;
  searchType: PollSearchType;
  skeletons?: React.ReactNode[];
}

export function PollList({
  polls,
  loading,
  meta,
  onLoadMore,
  searchType,
  skeletons,
}: PollListProps) {
  const { tags } = useTagContext();
  const { guilds, userVotes, setUserVote } = usePollDataContext();
  const {
    editModeEnabled,
    editablePolls,
    addNewPoll,
    handleEditChange,
    isPollEditable,
  } = useEditContext();

  const dataExists =
    polls &&
    tags &&
    guilds &&
    Object.keys(tags).length > 0 &&
    Object.keys(guilds).length > 0;

  const displayedPolls = !editModeEnabled ? polls : editablePolls;

  return (
    <FullWidthScroll>
      {dataExists && !loading ? (
        <InfiniteScroll
          dataLength={polls.length}
          next={onLoadMore}
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
  );
}
