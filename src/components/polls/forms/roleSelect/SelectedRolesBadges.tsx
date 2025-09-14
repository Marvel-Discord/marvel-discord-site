import { Role } from "@/api/discord";
import { SelectedRolesContainer, RoleBadge, RemoveRoleButton } from "./styles";

interface SelectedRolesBadgesProps {
  selectedRoleIds: string[];
  roles: Role[];
  onRemoveRole: (roleId: string) => void;
  formatColorToHex: (color: number) => string;
}

export function SelectedRolesBadges({
  selectedRoleIds,
  roles,
  onRemoveRole,
  formatColorToHex,
}: SelectedRolesBadgesProps) {
  if (selectedRoleIds.length === 0) return null;

  return (
    <SelectedRolesContainer>
      {selectedRoleIds.map((roleId) => {
        const role = roles.find((r) => r.id === roleId);
        if (!role) return null;

        const backgroundColor = formatColorToHex(role.color);
        const textColor = role.color === 0 ? "#000" : "#fff";

        return (
          <RoleBadge
            key={roleId}
            $backgroundColor={backgroundColor}
            $textColor={textColor}
          >
            @{role.name}
            <RemoveRoleButton onClick={() => onRemoveRole(roleId)}>
              ×
            </RemoveRoleButton>
          </RoleBadge>
        );
      })}
    </SelectedRolesContainer>
  );
}
