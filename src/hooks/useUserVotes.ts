import { useState, useCallback, useEffect } from "react";
import { getUserVotes } from "@/api/polls/votes";
import { createLogger } from "@/utils/logger";

const logger = createLogger("useUserVotes");

export function useUserVotes(user: { id: string } | null) {
  const [userVotes, setUserVotes] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!user) {
        setUserVotes({});
        return;
      }
      try {
        const response = await getUserVotes(user.id);
        const votes: Record<number, number> = Object.fromEntries(
          response.map((vote) => [vote.poll_id, vote.choice])
        );
        setUserVotes(votes);
      } catch (err) {
        logger.error("Failed to fetch user votes:", err);
      }
    };

    fetchUserVotes();
  }, [user]);

  const setUserVote = useCallback(
    (pollId: number, choice: number | undefined) => {
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
    },
    []
  );

  return { userVotes, setUserVote };
}
