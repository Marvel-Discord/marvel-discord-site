import { Select, Text, Flex } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { getGuildChannels, type Channel } from "@/api/discord";

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
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GUILD_ID = "281648235557421056";

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getGuildChannels(GUILD_ID);
        console.log(data);

        // Separate existing vs new channels and sort
        const existingChannels: Channel[] = [];
        const newChannels: Channel[] = [];

        data.forEach((channel) => {
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
        const sortedChannels = [...existingChannels, ...newChannels];

        setChannels(sortedChannels);
      } catch (err) {
        console.error("Error fetching channels:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load channels"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [existingChannelUsage]);

  if (loading) {
    return (
      <Select.Root value="" disabled>
        <Select.Trigger placeholder="Loading channels..." />
        <Select.Content />
      </Select.Root>
    );
  }

  if (error) {
    return (
      <Flex direction="column" gap="1">
        <Select.Root value="" disabled>
          <Select.Trigger placeholder="Error loading channels" />
          <Select.Content />
        </Select.Root>
        <Text size="1" color="red">
          {error}
        </Text>
      </Flex>
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
        {channels.map((channel, index) => {
          const isExisting = !!existingChannelUsage[channel.id];
          const isFirstNew =
            !isExisting &&
            index > 0 &&
            !!existingChannelUsage[channels[index - 1]?.id];

          return (
            <div key={channel.id}>
              {isFirstNew && <Select.Separator />}
              <Select.Item value={channel.id}>
                <Flex align="center" gap="2">
                  <Text># {channel.name}</Text>
                  {isExisting && (
                    <Text size="1" color="gray">
                      ({existingChannelUsage[channel.id]} tag
                      {existingChannelUsage[channel.id] === 1 ? "" : "s"})
                    </Text>
                  )}
                </Flex>
              </Select.Item>
            </div>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
