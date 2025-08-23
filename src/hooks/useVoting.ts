import { useRef, useEffect } from "react";
import type { Poll } from "@jocasta-polls-api";
import { postVote } from "@/api/polls/votes";
import { DEBOUNCE_DELAY } from "@/components/polls/forms/choices/constants";

export function useVoting({
  poll,
  user,
  userVote,
  setUserVote,
  votes,
  setVotes,
  editable,
}: {
  poll: Poll;
  user: { id: string } | null;
  userVote?: number;
  setUserVote: (vote: number | undefined) => void;
  votes?: Poll["votes"];
  setVotes: (votes: Poll["votes"]) => void;
  editable: boolean;
}) {
  const voteTimeout = useRef<NodeJS.Timeout | null>(null);

  async function handleVote(index: number) {
    if (!user || editable) return;

    let choice: number | undefined = index;
    if (userVote === index) {
      choice = undefined;
    }

    if (votes) {
      const updatedVotes = [...votes];
      if (choice === undefined || userVote !== undefined) {
        updatedVotes[index]--;
      }

      if (choice !== undefined) {
        updatedVotes[choice]++;
      }

      setVotes(updatedVotes);
    }

    setUserVote(choice);

    if (voteTimeout.current) {
      clearTimeout(voteTimeout.current);
    }

    voteTimeout.current = setTimeout(() => {
      postVote(poll.id, user.id, choice).catch((err) => {
        console.error("Failed to post vote:", err);
      });
    }, DEBOUNCE_DELAY);
  }

  useEffect(() => {
    return () => {
      if (voteTimeout.current) {
        clearTimeout(voteTimeout.current);
      }
    };
  }, []);

  return { handleVote };
}
