// Query key factory for consistent query key management
export const queryKeys = {
  // Auth queries
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },

  // Tags queries
  tags: {
    all: ["tags"] as const,
    list: () => [...queryKeys.tags.all, "list"] as const,
  },

  // Polls queries
  polls: {
    all: ["polls"] as const,
    lists: () => [...queryKeys.polls.all, "list"] as const,
    list: (params: {
      guildId?: string | bigint;
      published?: boolean;
      tag?: number;
      userId?: bigint;
      notVoted?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }) => [...queryKeys.polls.lists(), params] as const,
    details: () => [...queryKeys.polls.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.polls.details(), id] as const,
  },

  // Votes queries
  votes: {
    all: ["votes"] as const,
    userVotes: (userId: string) =>
      [...queryKeys.votes.all, "user", userId] as const,
  },

  // Guilds queries
  guilds: {
    all: ["guilds"] as const,
    lists: () => [...queryKeys.guilds.all, "list"] as const,
    details: () => [...queryKeys.guilds.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.guilds.details(), id] as const,
  },
} as const;
