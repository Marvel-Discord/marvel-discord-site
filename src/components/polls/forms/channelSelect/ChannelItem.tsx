import { Select, Text } from "@radix-ui/themes";
import { Channel } from "@/api/discord";
import { ChannelItemContainer, ChannelName } from "./styles";

interface ChannelItemProps {
  channel: Channel;
  isExisting: boolean;
  existingCount?: number;
}

export function ChannelItem({
  channel,
  isExisting,
  existingCount,
}: ChannelItemProps) {
  return (
    <Select.Item value={channel.id}>
      <ChannelItemContainer>
        <Text>
          <ChannelName>{channel.name}</ChannelName>
        </Text>
        {isExisting && existingCount && (
          <Text size="1" color="gray">
            ({existingCount} tag{existingCount === 1 ? "" : "s"})
          </Text>
        )}
      </ChannelItemContainer>
    </Select.Item>
  );
}
