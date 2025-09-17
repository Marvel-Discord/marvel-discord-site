import { Select, Text } from "@radix-ui/themes";
import { useState, useEffect, useMemo } from "react";
import { getGuildChannels, type Channel } from "@/api/discord";
import {
  LoadingSelectRoot,
  ErrorContainer,
  ChannelItem,
} from "./channelSelect/";
import config from "@/app/config/config";
import { createLogger } from "@/utils/logger";

const logger = createLogger("ChannelSelect");

interface ChannelSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  existingChannelUsage?: Record<string, number>;
}

export function ChannelSelect({
  value,
  onValueChange,
  placeholder = "Select a channel...",
  disabled = false,
  existingChannelUsage = {},
}: ChannelSelectProps) {
  const [rawChannels, setRawChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GUILD_ID = config.guildId;

  // Fetch channels only once on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getGuildChannels(GUILD_ID);

        setRawChannels(data);
      } catch (err) {
        logger.error("Error fetching channels:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load channels"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  // Sort channels based on existing usage (memoized for performance)
  const sortedChannels = useMemo(() => {
    // Separate existing vs new channels and sort
    const existingChannels: Channel[] = [];
    const newChannels: Channel[] = [];

    rawChannels.forEach((channel) => {
      if (existingChannelUsage[channel.id]) {
        existingChannels.push(channel);
      } else {
        newChannels.push(channel);
      }
    });

    // Sort existing channels by usage count (most to least frequent)
    existingChannels.sort((a, b) => {
      const countA = existingChannelUsage[a.id] || 0;
      const countB = existingChannelUsage[b.id] || 0;
      return countB - countA;
    });

    // Sort new channels by position
    newChannels.sort((a, b) => a.position - b.position);

    // Combine: existing channels first, then new channels
    return [...existingChannels, ...newChannels];
  }, [rawChannels, existingChannelUsage]);

  if (loading) {
    return (
      <LoadingSelectRoot value="" disabled>
        <Select.Trigger placeholder="Loading channels..." />
        <Select.Content />
      </LoadingSelectRoot>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Select.Root value="" disabled>
          <Select.Trigger placeholder="Error loading channels" />
          <Select.Content />
        </Select.Root>
        <Text size="1" color="red">
          {error}
        </Text>
      </ErrorContainer>
    );
  }

  return (
    <Select.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger placeholder={placeholder} />
      <Select.Content>
        {sortedChannels.map((channel, index) => {
          const isExisting = !!existingChannelUsage[channel.id];
          const isFirstNew =
            !isExisting &&
            index > 0 &&
            !!existingChannelUsage[sortedChannels[index - 1]?.id];

          return (
            <div key={channel.id}>
              {isFirstNew && <Select.Separator />}
              <ChannelItem
                channel={channel}
                isExisting={isExisting}
                existingCount={existingChannelUsage[channel.id]}
              />
            </div>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
