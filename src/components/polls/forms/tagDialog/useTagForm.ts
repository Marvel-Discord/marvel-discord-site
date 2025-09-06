import { useState, useEffect, useMemo } from "react";
import type { Tag } from "@jocasta-polls-api";
import { useTagContext } from "@/contexts/TagContext";

// Extended type for form data (includes pending tag fields)
export type TagFormData = Partial<Tag>;

interface UseTagFormProps {
  editingTag?: TagFormData | null;
  onTagCreated: (tag: TagFormData) => void;
  onOpenChange: (open: boolean) => void;
}

export function useTagForm({
  editingTag,
  onTagCreated,
  onOpenChange,
}: UseTagFormProps) {
  const [tagName, setTagName] = useState("");
  const [discordChannel, setDiscordChannel] = useState("");
  const [currentNum, setCurrentNum] = useState<number | null>(null);
  const [colour, setColour] = useState("");
  const [endMessage, setEndMessage] = useState("");
  const [endMessageRoleIds, setEndMessageRoleIds] = useState<string[]>([]);
  const [endMessagePing, setEndMessagePing] = useState(false);
  const [endMessageSelfAssign, setEndMessageSelfAssign] = useState(false);
  const [persistent, setPersistent] = useState(true);

  const { tags } = useTagContext();
  const isEditing = editingTag !== null;

  // Memoized helpers for existing data
  const existingChannels = useMemo(() => {
    const channelCounts: Record<string, number> = {};
    Object.values(tags).forEach((tag) => {
      if (tag.channel_id) {
        const channelId = tag.channel_id.toString();
        channelCounts[channelId] = (channelCounts[channelId] || 0) + 1;
      }
    });
    return channelCounts;
  }, [tags]);

  const existingRoles = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    Object.values(tags).forEach((tag) => {
      if (tag.end_message_role_ids) {
        tag.end_message_role_ids.forEach((roleId) => {
          const roleIdStr = roleId.toString();
          roleCounts[roleIdStr] = (roleCounts[roleIdStr] || 0) + 1;
        });
      }
    });
    return roleCounts;
  }, [tags]);

  const existingEndMessages = useMemo(() => {
    const messageCounts: Record<string, number> = {};
    Object.values(tags).forEach((tag) => {
      if (tag.end_message && tag.end_message.trim() !== "") {
        const message = tag.end_message.trim();
        messageCounts[message] = (messageCounts[message] || 0) + 1;
      }
    });
    return messageCounts;
  }, [tags]);

  // Reset form when editingTag changes
  useEffect(() => {
    if (editingTag) {
      setTagName(editingTag.name || "");
      setDiscordChannel(editingTag.channel_id?.toString() || "");
      setCurrentNum(editingTag.current_num || null);
      setColour(editingTag.colour?.toString() || "");
      setEndMessage(editingTag.end_message || "");
      setEndMessageRoleIds(
        editingTag.end_message_role_ids?.map((id) => id.toString()) || []
      );
      setEndMessagePing(editingTag.end_message_ping || false);
      setEndMessageSelfAssign(editingTag.end_message_self_assign || false);
      setPersistent(editingTag.persistent ?? true);
    } else {
      resetForm();
    }
  }, [editingTag]);

  // Effect to disable role-related options when no roles are selected
  useEffect(() => {
    if (endMessageRoleIds.length === 0) {
      setEndMessagePing(false);
      setEndMessageSelfAssign(false);
    }
  }, [endMessageRoleIds]);

  const resetForm = () => {
    setTagName("");
    setDiscordChannel("");
    setCurrentNum(null);
    setColour("");
    setEndMessage("");
    setEndMessageRoleIds([]);
    setEndMessagePing(false);
    setEndMessageSelfAssign(false);
    setPersistent(true);
  };

  const handleSubmit = () => {
    if (!tagName.trim() || !discordChannel.trim()) return;

    // Helper function to convert hex color to number
    const colorToNumber = (hexColor: string): number | null => {
      if (!hexColor) return null;
      const hex = hexColor.replace("#", "");
      return hex ? parseInt(hex, 16) : null;
    };

    // Helper function to convert role IDs to bigint array
    const roleIdsToBigInt = (roleIds: string[]): bigint[] => {
      return roleIds
        .filter((id) => id.trim() !== "")
        .map((id) => BigInt(id.trim()));
    };

    const tag: TagFormData = isEditing
      ? {
          ...editingTag,
          name: tagName.trim(),
          channel_id: discordChannel ? BigInt(discordChannel) : BigInt(0),
          current_num: currentNum,
          colour: colorToNumber(colour),
          end_message: endMessage || null,
          end_message_role_ids: roleIdsToBigInt(endMessageRoleIds),
          end_message_ping: endMessagePing,
          end_message_self_assign: endMessageSelfAssign,
          persistent: persistent,
        }
      : {
          tag: -Date.now(), // negative ID to indicate it's pending
          name: tagName.trim(),
          channel_id: discordChannel ? BigInt(discordChannel) : BigInt(0),
          colour: colorToNumber(colour),
          current_num: currentNum,
          end_message: endMessage || null,
          end_message_role_ids: roleIdsToBigInt(endMessageRoleIds),
          end_message_ping: endMessagePing,
          end_message_self_assign: endMessageSelfAssign,
          persistent: persistent,
          guild_id: BigInt(0), // Will be set by the server
          crosspost_channels: [],
          crosspost_servers: [],
          end_message_latest_ids: [],
        };

    onTagCreated(tag);
    onOpenChange(false);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const canSubmit = tagName.trim() !== "" && discordChannel.trim() !== "";

  return {
    // Form state
    tagName,
    setTagName,
    discordChannel,
    setDiscordChannel,
    currentNum,
    setCurrentNum,
    colour,
    setColour,
    endMessage,
    setEndMessage,
    endMessageRoleIds,
    setEndMessageRoleIds,
    endMessagePing,
    setEndMessagePing,
    endMessageSelfAssign,
    setEndMessageSelfAssign,
    persistent,
    setPersistent,

    // Computed values
    isEditing,
    canSubmit,
    existingChannels,
    existingRoles,
    existingEndMessages,

    // Actions
    handleSubmit,
    handleCancel,
  };
}
