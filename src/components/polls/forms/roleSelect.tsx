import { Select, Text, Flex, Badge } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { getGuildRoles, type Role } from "@/api/discord";

interface RoleSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  existingRoleUsage?: Record<string, number>;
}

export function RoleSelect({
  value,
  onValueChange,
  placeholder = "Select roles...",
  disabled = false,
  multiple = true,
  existingRoleUsage = {},
}: RoleSelectProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GUILD_ID = "281648235557421056";

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getGuildRoles(GUILD_ID);

        // Filter out @everyone role
        const filteredData = data.filter(
          (role: Role) => role.name !== "@everyone"
        );

        // Separate existing vs new roles
        const existingRoles: Role[] = [];
        const newRoles: Role[] = [];

        filteredData.forEach((role) => {
          if (existingRoleUsage[role.id]) {
            existingRoles.push(role);
          } else {
            newRoles.push(role);
          }
        });

        // Sort existing roles by usage count (most to least frequent)
        existingRoles.sort((a, b) => {
          const countA = existingRoleUsage[a.id] || 0;
          const countB = existingRoleUsage[b.id] || 0;
          return countB - countA;
        });

        // Sort new roles by position (higher position = higher in hierarchy)
        newRoles.sort((a, b) => b.position - a.position);

        // Combine: existing roles first, then new roles
        const sortedRoles = [...existingRoles, ...newRoles];

        setRoles(sortedRoles);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError(err instanceof Error ? err.message : "Failed to load roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [existingRoleUsage]);

  const handleValueChange = (newValue: string) => {
    if (multiple) {
      const updatedValues = value.includes(newValue)
        ? value.filter((v) => v !== newValue)
        : [...value, newValue];
      onValueChange(updatedValues);
    } else {
      onValueChange([newValue]);
    }
  };

  const formatColorToHex = (color: number): string => {
    if (color === 0) return "#99AAB5"; // Default Discord color for colorless roles
    return `#${color.toString(16).padStart(6, "0")}`;
  };

  const getSelectedText = (): string => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const role = roles.find((r) => r.id === value[0]);
      return role ? `@${role.name}` : "Unknown role";
    }
    return `${value.length} roles selected`;
  };

  if (loading) {
    return (
      <Select.Root value="" disabled>
        <Select.Trigger placeholder="Loading roles..." />
        <Select.Content />
      </Select.Root>
    );
  }

  if (error) {
    return (
      <Flex direction="column" gap="1">
        <Select.Root value="" disabled>
          <Select.Trigger placeholder="Error loading roles" />
          <Select.Content />
        </Select.Root>
        <Text size="1" color="red">
          {error}
        </Text>
      </Flex>
    );
  }

  if (multiple) {
    return (
      <Flex direction="column" gap="2">
        <Select.Root
          value=""
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <Select.Trigger placeholder={getSelectedText()} />
          <Select.Content>
            {roles.map((role, index) => {
              const isExisting = !!existingRoleUsage[role.id];
              const isFirstNew =
                !isExisting &&
                index > 0 &&
                !!existingRoleUsage[roles[index - 1]?.id];

              return (
                <div key={role.id}>
                  {isFirstNew && <Select.Separator />}
                  <Select.Item value={role.id}>
                    <Flex align="center" gap="2">
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: formatColorToHex(role.color),
                          flexShrink: 0,
                        }}
                      />
                      <Text>@{role.name}</Text>
                      {isExisting && (
                        <Text size="1" color="gray">
                          ({existingRoleUsage[role.id]} tag
                          {existingRoleUsage[role.id] === 1 ? "" : "s"})
                        </Text>
                      )}
                      {value.includes(role.id) && (
                        <Badge size="1" color="green">
                          ✓
                        </Badge>
                      )}
                    </Flex>
                  </Select.Item>
                </div>
              );
            })}
          </Select.Content>
        </Select.Root>

        {value.length > 0 && (
          <Flex gap="1" wrap="wrap">
            {value.map((roleId) => {
              const role = roles.find((r) => r.id === roleId);
              if (!role) return null;
              return (
                <Badge
                  key={roleId}
                  size="1"
                  style={{
                    backgroundColor: formatColorToHex(role.color),
                    color: role.color === 0 ? "#000" : "#fff",
                  }}
                >
                  @{role.name}
                  <button
                    onClick={() => handleValueChange(roleId)}
                    style={{
                      marginLeft: "4px",
                      background: "none",
                      border: "none",
                      color: "inherit",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </Flex>
        )}
      </Flex>
    );
  }

  // Single select mode
  return (
    <Select.Root
      value={value[0] || ""}
      onValueChange={(newValue) => onValueChange([newValue])}
      disabled={disabled}
    >
      <Select.Trigger placeholder={placeholder} />
      <Select.Content>
        {roles.map((role, index) => {
          const isExisting = !!existingRoleUsage[role.id];
          const isFirstNew =
            !isExisting &&
            index > 0 &&
            !!existingRoleUsage[roles[index - 1]?.id];

          return (
            <div key={role.id}>
              {isFirstNew && <Select.Separator />}
              <Select.Item value={role.id}>
                <Flex align="center" gap="2">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: formatColorToHex(role.color),
                      flexShrink: 0,
                    }}
                  />
                  <Text>@{role.name}</Text>
                  {isExisting && (
                    <Text size="1" color="gray">
                      ({existingRoleUsage[role.id]} tag
                      {existingRoleUsage[role.id] === 1 ? "" : "s"})
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
