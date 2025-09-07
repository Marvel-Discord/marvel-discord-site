import { Select, Text, Flex, Badge } from "@radix-ui/themes";
import { useState, useEffect, useMemo } from "react";
import { getGuildRoles, type Role } from "@/api/discord";
import {
  RoleSelectContainer,
  LoadingSelectRoot,
  ErrorContainer,
  RoleItem,
  SelectedRolesBadges,
} from "./roleSelect/";
import config from "@/app/config/config";

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
  const [rawRoles, setRawRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GUILD_ID = config.guildId;

  // Fetch roles only once on mount
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

        setRawRoles(filteredData);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError(err instanceof Error ? err.message : "Failed to load roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Sort roles based on existing usage (memoized for performance)
  const sortedRoles = useMemo(() => {
    // Separate existing vs new roles
    const existingRoles: Role[] = [];
    const newRoles: Role[] = [];

    rawRoles.forEach((role) => {
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
    return [...existingRoles, ...newRoles];
  }, [rawRoles, existingRoleUsage]);

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
      const role = sortedRoles.find((r) => r.id === value[0]);
      return role ? `@${role.name}` : "Unknown role";
    }
    return `${value.length} roles selected`;
  };

  if (loading) {
    return (
      <LoadingSelectRoot value="" disabled>
        <Select.Trigger placeholder="Loading roles..." />
        <Select.Content />
      </LoadingSelectRoot>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Select.Root value="" disabled>
          <Select.Trigger placeholder="Error loading roles" />
          <Select.Content />
        </Select.Root>
        <Text size="1" color="red">
          {error}
        </Text>
      </ErrorContainer>
    );
  }

  if (multiple) {
    return (
      <RoleSelectContainer>
        <Select.Root
          value=""
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <Select.Trigger placeholder={getSelectedText()} />
          <Select.Content>
            {sortedRoles.map((role, index) => {
              const isExisting = !!existingRoleUsage[role.id];
              const isFirstNew =
                !isExisting &&
                index > 0 &&
                !!existingRoleUsage[sortedRoles[index - 1]?.id];

              return (
                <div key={role.id}>
                  {isFirstNew && <Select.Separator />}
                  <RoleItem
                    role={role}
                    isExisting={isExisting}
                    existingCount={existingRoleUsage[role.id]}
                    isSelected={value.includes(role.id)}
                    formatColorToHex={formatColorToHex}
                  />
                </div>
              );
            })}
          </Select.Content>
        </Select.Root>

        <SelectedRolesBadges
          selectedRoleIds={value}
          roles={sortedRoles}
          onRemoveRole={handleValueChange}
          formatColorToHex={formatColorToHex}
        />
      </RoleSelectContainer>
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
        {sortedRoles.map((role, index) => {
          const isExisting = !!existingRoleUsage[role.id];
          const isFirstNew =
            !isExisting &&
            index > 0 &&
            !!existingRoleUsage[sortedRoles[index - 1]?.id];

          return (
            <div key={role.id}>
              {isFirstNew && <Select.Separator />}
              <RoleItem
                role={role}
                isExisting={isExisting}
                existingCount={existingRoleUsage[role.id]}
                formatColorToHex={formatColorToHex}
              />
            </div>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
