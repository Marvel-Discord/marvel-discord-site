import React, { useState, useEffect } from "react";
import { Button, Link } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import type { Poll, Tag } from "@jocasta-polls-api";
import { useAuthContext } from "@/contexts/AuthProvider";
import config from "@/app/config/config";
import { useVoting, useChoicesManager } from "@/hooks";
import {
  ChoiceAlert,
  ChoiceContainer,
  ChoiceLabelMap,
  Container,
  ChoiceContainerStyle,
  ChoiceContainerButton,
} from "./index";

interface ChoicesProps {
  editable?: boolean;
  poll: Poll;
  setUserVote?: (vote: number | undefined) => void;
  setVotes?: (votes: Poll["votes"]) => void;
  tag?: Tag;
  userVote?: number;
  votes?: Poll["votes"];
  handleChoicesChange?: (choices: string[]) => void;
  showVotes?: boolean;
}

export function Choices({
  editable = false,
  poll,
  setUserVote = () => {},
  setVotes = () => {},
  tag,
  userVote,
  votes = [],
  handleChoicesChange = () => {},
  showVotes,
}: ChoicesProps) {
  const { user } = useAuthContext();
  const router = useRouter();

  const { handleVote } = useVoting({
    poll,
    user,
    userVote,
    setUserVote,
    votes,
    setVotes,
    editable,
  });

  const { choices, handleChoiceTextChange, handleChoiceDelete } =
    useChoicesManager({
      poll,
      editable,
      handleChoicesChange,
    });

  const totalVotes = (votes ?? []).reduce((acc, vote) => acc + vote, 0);
  const percentageVotes =
    votes?.map((vote) =>
      totalVotes === 0 ? 0 : Number((vote / totalVotes) * 100)
    ) || [];

  const choiceComponents = choices.map((choice, index) => {
    const choiceElement = (
      <ChoiceContainer
        key={ChoiceLabelMap[index + 1]}
        index={index}
        tag={tag}
        choice={choice}
        setChoice={
          editable
            ? (val: string) => handleChoiceTextChange(index, val)
            : undefined
        }
        poll={poll}
        percentageVotes={percentageVotes}
        onDelete={editable ? () => handleChoiceDelete(index) : undefined}
        enticer={editable && index === choices.length - 1 && !poll.published}
        editable={editable}
        userVote={userVote}
        showVotes={showVotes && poll.show_voting}
      />
    );

    if (!editable) {
      const choiceButton = (
        <ChoiceContainerButton
          onClick={async () => await handleVote(index)}
          key={ChoiceLabelMap[index + 1]}
        >
          {choiceElement}
        </ChoiceContainerButton>
      );

      if (!user) {
        return (
          <ChoiceAlert
            key={ChoiceLabelMap[index + 1]}
            trigger={choiceButton}
            title="Sign In Required"
            description="You need to sign in with Discord to vote on this poll."
            button={
              <Button
                variant="ghost"
                onClick={() => {
                  router.push(`${config.apiUrlPolls}/auth`);
                }}
              >
                Sign In
              </Button>
            }
          />
        );
      }

      const inServer = user?.guilds?.some(
        (guild) => guild.id === poll.guild_id.toString()
      );

      if (!inServer) {
        return (
          <ChoiceAlert
            key={ChoiceLabelMap[index + 1]}
            trigger={choiceButton}
            title="Not In Server"
            description="You need to join the Marvel Discord server to be able to vote."
            button={
              <Link href="https://discord.gg/marvel" target="_blank">
                <Button variant="ghost">Join Server</Button>
              </Link>
            }
          />
        );
      }

      return choiceButton;
    }

    return choiceElement;
  });

  return (
    <Container>
      <ChoiceContainerStyle>{choiceComponents}</ChoiceContainerStyle>
    </Container>
  );
}
