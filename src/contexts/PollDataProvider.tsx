import React, { createContext, useContext, useEffect, useState } from "react";
import { getGuilds } from "@/api/polls/guilds";
import { createPolls, updatePolls, deletePolls } from "@/api/polls/polls";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useUserVotes } from "@/hooks/useUserVotes";
import type { PollInfo, Poll } from "@jocasta-polls-api";

interface PollDataContextValue {
  guilds: Record<string, PollInfo>;
  userVotes: Record<number, number>;
  setUserVote: (pollId: number, choice: number | undefined) => void;
  createPolls: (
    polls: Omit<Poll, "id">[]
  ) => Promise<{ success: boolean; polls?: Poll[]; message?: string }>;
  updatePolls: (
    polls: Poll[]
  ) => Promise<{ success: boolean; message?: string }>;
  deletePolls: (
    pollIds: string[]
  ) => Promise<{ success: boolean; message?: string }>;
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

  // CRUD operations
  const createNewPolls = async (
    newPolls: Omit<Poll, "id">[]
  ): Promise<{ success: boolean; polls?: Poll[]; message?: string }> => {
    try {
      const createdPolls = await createPolls(newPolls);
      return {
        success: true,
        polls: createdPolls,
        message: "Polls created successfully!",
      };
    } catch (error) {
      console.error("Failed to create polls:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create polls",
      };
    }
  };

  const updateExistingPolls = async (
    updatedPolls: Poll[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await updatePolls(updatedPolls);
      return { success: true, message: "Polls updated successfully!" };
    } catch (error) {
      console.error("Failed to update polls:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update polls",
      };
    }
  };

  const deleteExistingPolls = async (
    pollIds: string[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await deletePolls(pollIds);
      return { success: true, message: "Polls deleted successfully!" };
    } catch (error) {
      console.error("Failed to delete polls:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete polls",
      };
    }
  };

  const value: PollDataContextValue = {
    guilds,
    userVotes,
    setUserVote,
    createPolls: createNewPolls,
    updatePolls: updateExistingPolls,
    deletePolls: deleteExistingPolls,
  };

  return (
    <PollDataContext.Provider value={value}>
      {children}
    </PollDataContext.Provider>
  );
}
