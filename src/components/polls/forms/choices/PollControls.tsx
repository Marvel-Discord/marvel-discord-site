import React, { type Dispatch, type SetStateAction, useState } from "react";
import { Button } from "@radix-ui/themes";
import styled from "styled-components";
import type { Poll } from "@jocasta-polls-api";
import { ShowVotesButton } from "./ShowVotesButton";
import { ThreadQuestionDialog } from "./ThreadQuestionDialog";
import { MessageCircleQuestion } from "lucide-react";

const PollControlsContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  width: 100%;
`;

const ThreadQuestionButtonStyle = styled(Button).attrs({
  variant: "ghost",
  color: "gray",
  size: "1",
})`
  margin-inline: 0rem;
  width: fit-content;
`;

interface PollControlsProps {
  poll: Poll;
  showVotes: boolean;
  setShowVotes: Dispatch<SetStateAction<boolean>>;
  editing: boolean;
}

export function PollControls({
  poll,
  showVotes,
  setShowVotes,
  editing,
}: PollControlsProps) {
  const [threadQuestionDialogOpen, setThreadQuestionDialogOpen] =
    useState(false);

  const handleThreadQuestion = () => {
    setThreadQuestionDialogOpen(true);
  };

  return (
    <>
      <PollControlsContainer>
        <ShowVotesButton
          poll={poll}
          showVotes={showVotes}
          setShowVotes={setShowVotes}
          editing={editing}
        />
        {(poll.thread_question || editing) && (
          <ThreadQuestionButtonStyle onClick={handleThreadQuestion}>
            <MessageCircleQuestion size={16} />
            {poll.thread_question
              ? poll.thread_question === "def"
                ? "Default Thread Question"
                : poll.thread_question
              : "Set Thread Question"}
          </ThreadQuestionButtonStyle>
        )}
      </PollControlsContainer>

      <ThreadQuestionDialog
        open={threadQuestionDialogOpen}
        onOpenChange={setThreadQuestionDialogOpen}
        poll={poll}
        editable={editing}
      />
    </>
  );
}
