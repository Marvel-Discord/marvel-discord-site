import { useQuery } from "@tanstack/react-query";
import { getGuilds, getGuild } from "@/api/polls/guilds";
import { queryKeys } from "@/lib/queryKeys";
import type { PollInfo } from "@jocasta-polls-api";
import { useMemo } from "react";

export function useGuilds() {
  return useQuery({
    queryKey: queryKeys.guilds.lists(),
    queryFn: getGuilds,
    staleTime: 1000 * 60 * 15, // 15 minutes - guilds don't change often
  });
}

export function useGuild(guildId?: string) {
  return useQuery({
    queryKey: queryKeys.guilds.detail(guildId!),
    queryFn: () => getGuild(guildId!),
    enabled: !!guildId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook to get guilds in a more convenient format (Record)
export function useGuildsFormatted() {
  const { data: guilds, ...queryResult } = useGuilds();
  
  const formattedGuilds = useMemo(() => {
    if (!guilds) {
      return {} as Record<string, PollInfo>;
    }
    
    return Object.fromEntries(
      guilds.map((guild) => [guild.guild_id, guild])
    );
  }, [guilds]);
  
  return {
    guilds: formattedGuilds,
    ...queryResult,
    data: guilds,
  };
}
