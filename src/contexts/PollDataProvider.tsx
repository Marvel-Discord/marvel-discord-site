import React, { createContext, useContext, useEffect, useState } from "react";
import { getGuilds } from "@/api/polls/guilds";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useUserVotes } from "@/hooks/useUserVotes";
import type { PollInfo } from "@jocasta-polls-api";

interface PollDataContextValue {
  guilds: Record<string, PollInfo>;
  userVotes: Record<number, number>;
  setUserVote: (pollId: number, choice: number | undefined) => void;
}

const PollDataContext = createContext<PollDataContextValue | undefined>(
  undefined
);

export function usePollDataContext() {
  const context = useContext(PollDataContext);
  if (!context) {
    throw new Error(
      "usePollDataContext must be used within a PollDataProvider"
    );
  }
  return context;
}

export function PollDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const [guilds, setGuilds] = useState<Record<string, PollInfo>>({});
  const { userVotes, setUserVote } = useUserVotes(user);

  useEffect(() => {
    const fetchGuilds = async () => {
      try {
        const response = await getGuilds();
        const guildsMap: Record<string, PollInfo> = Object.fromEntries(
          response.map((guild) => [guild.guild_id, guild])
        );
        setGuilds(guildsMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGuilds();
  }, []);

  const value: PollDataContextValue = {
    guilds,
    userVotes,
    setUserVote,
  };

  return (
    <PollDataContext.Provider value={value}>
      {children}
    </PollDataContext.Provider>
  );
}
