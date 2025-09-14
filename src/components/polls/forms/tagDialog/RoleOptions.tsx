import { Text } from "@radix-ui/themes";
import { TagOptionsContainer, TagOptionLabel, StyledCheckbox } from "./styles";

interface TagOptionsProps {
  endMessageRoleIds: string[];
  endMessagePing: boolean;
  endMessageSelfAssign: boolean;
  persistent: boolean;
  onEndMessagePingChange: (checked: boolean) => void;
  onEndMessageSelfAssignChange: (checked: boolean) => void;
  onPersistentChange: (checked: boolean) => void;
}

export function TagOptions({
  endMessageRoleIds,
  endMessagePing,
  endMessageSelfAssign,
  persistent,
  onEndMessagePingChange,
  onEndMessageSelfAssignChange,
  onPersistentChange,
}: TagOptionsProps) {
  const hasRoles = endMessageRoleIds.length > 0;

  return (
    <TagOptionsContainer>
      <TagOptionLabel $disabled={!hasRoles}>
        <StyledCheckbox
          checked={endMessagePing}
          disabled={!hasRoles}
          onCheckedChange={(checked) =>
            onEndMessagePingChange(checked as boolean)
          }
        />
        <Text size="2">Ping the roles after each poll</Text>
      </TagOptionLabel>

      <TagOptionLabel $disabled={!hasRoles}>
        <StyledCheckbox
          checked={endMessageSelfAssign}
          disabled={!hasRoles}
          onCheckedChange={(checked) =>
            onEndMessageSelfAssignChange(checked as boolean)
          }
        />
        <Text size="2">Let users self-assign the ping roles with a button</Text>
      </TagOptionLabel>

      <TagOptionLabel>
        <StyledCheckbox
          checked={persistent}
          onCheckedChange={(checked) => onPersistentChange(checked as boolean)}
        />
        <Text size="2">
          Share end-message sending/deletion with other tags in the same channel
        </Text>
      </TagOptionLabel>
    </TagOptionsContainer>
  );
}
