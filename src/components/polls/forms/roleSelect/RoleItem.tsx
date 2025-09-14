import { Select, Text } from "@radix-ui/themes";
import { Role } from "@/api/discord";
import { RoleItemContainer, RoleColorIndicator } from "./styles";

interface RoleItemProps {
  role: Role;
  isExisting: boolean;
  existingCount?: number;
  isSelected?: boolean;
  formatColorToHex: (color: number) => string;
}

export function RoleItem({
  role,
  isExisting,
  existingCount,
  isSelected,
  formatColorToHex,
}: RoleItemProps) {
  return (
    <Select.Item value={role.id}>
      <RoleItemContainer>
        <RoleColorIndicator $color={formatColorToHex(role.color)} />
        <Text>@{role.name}</Text>
        {isExisting && existingCount && (
          <Text size="1" color="gray">
            ({existingCount} tag{existingCount === 1 ? "" : "s"})
          </Text>
        )}
        {isSelected && (
          <Text size="1" color="green">
            ✓
          </Text>
        )}
      </RoleItemContainer>
    </Select.Item>
  );
}
