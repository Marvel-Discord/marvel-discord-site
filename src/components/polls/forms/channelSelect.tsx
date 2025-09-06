import { Select, Text, Flex } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { getGuildChannels, type Channel } from "@/api/discord";

interface ChannelSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChannelSelect({
  value,
  onValueChange,
  placeholder = "Select a channel...",
  disabled = false,
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

        const textChannels = data.sort(
          (a: Channel, b: Channel) => a.position - b.position
        );

        setChannels(textChannels);
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
  }, []);

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
        {channels.map((channel) => (
          <Select.Item key={channel.id} value={channel.id}>
            <Flex align="center" gap="2">
              <Text># {channel.name}</Text>
            </Flex>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
