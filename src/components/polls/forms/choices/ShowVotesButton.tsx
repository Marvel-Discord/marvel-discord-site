import React, { type Dispatch, type SetStateAction } from "react";
import { Text, Skeleton } from "@radix-ui/themes";
import { Eye, EyeClosed, Lock, LockOpen } from "lucide-react";
import type { Poll } from "@jocasta-polls-api";
import { ShowVotesButtonStyle } from "./styles";

interface ShowVotesButtonProps {
  editing?: boolean;
  poll: Poll;
  setShowVotes: Dispatch<SetStateAction<boolean>>;
  showVotes: boolean;
}

export function ShowVotesButton({
  editing = false,
  poll,
  setShowVotes,
  showVotes,
}: ShowVotesButtonProps) {
  const showVoting = poll?.show_voting;

  return (
    <ShowVotesButtonStyle
      onClick={() => {
        setShowVotes((prev) => !prev);
      }}
      disabled={!showVoting}
    >
      {showVotes ? (
        <>
          Hide Votes
          {editing ? <Lock size="0.8rem" /> : <Eye size="0.8rem" />}
        </>
      ) : (
        <>
          Show Votes
          {editing ? (
            <LockOpen size="0.8rem" />
          ) : !showVoting ? (
            <Lock size="0.8rem" />
          ) : (
            <EyeClosed size="0.8rem" />
          )}
        </>
      )}
    </ShowVotesButtonStyle>
  );
}

export function ShowVotesButtonSkeleton() {
  return (
    <ShowVotesButtonStyle disabled>
      <Skeleton>
        <Text size="1">Show Votes</Text>
      </Skeleton>
    </ShowVotesButtonStyle>
  );
}
