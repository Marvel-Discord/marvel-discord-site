import { useState, useEffect, useMemo, ChangeEvent } from "react";
import {
  Button,
  Dialog,
  Flex,
  Text,
  TextField,
  TextArea,
  Checkbox,
} from "@radix-ui/themes";
import type { Tag } from "@jocasta-polls-api";
import { ChannelSelect } from "./channelSelect";
import { RoleSelect } from "./roleSelect";
import { EndMessageSelect } from "./endMessageSelect";
import { useTagContext } from "@/contexts/TagContext";

// Extended type for form data (includes pending tag fields)
type TagFormData = Partial<Tag>;

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagCreated: (tag: TagFormData) => void;
  editingTag?: TagFormData | null;
}

export function TagDialog({
  open,
  onOpenChange,
  onTagCreated,
  editingTag = null,
}: TagDialogProps) {
  const [tagName, setTagName] = useState("");
  const [discordChannel, setDiscordChannel] = useState("");
  const [currentNum, setCurrentNum] = useState<number | null>(null);
  const [colour, setColour] = useState("");
  const [endMessage, setEndMessage] = useState("");
  const [endMessageRoleIds, setEndMessageRoleIds] = useState<string[]>([]);
  const [endMessagePing, setEndMessagePing] = useState(false);
  const [endMessageSelfAssign, setEndMessageSelfAssign] = useState(false);
  const [persistent, setPersistent] = useState(true);

  const isEditing = editingTag !== null;
  const { tags } = useTagContext();

  // Memoized helper to get existing channel IDs and their usage counts
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

  // Memoized helper to get existing role IDs and their usage counts
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

  // Memoized helper to get existing end messages and their usage counts
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

  // Update form fields when editingTag changes
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
      // Reset all fields for new tag
      setTagName("");
      setDiscordChannel("");
      setCurrentNum(null);
      setColour("");
      setEndMessage("");
      setEndMessageRoleIds([]);
      setEndMessagePing(false);
      setEndMessageSelfAssign(false);
      setPersistent(true);
    }
  }, [editingTag]);

  // Effect to disable and reset role-related checkboxes when no roles are selected
  useEffect(() => {
    if (endMessageRoleIds.length === 0) {
      setEndMessagePing(false);
      setEndMessageSelfAssign(false);
    }
  }, [endMessageRoleIds]);

  // Helper to determine if role-related options should be disabled
  const hasRoles = endMessageRoleIds.length > 0;

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

    // Reset form
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

  const handleCancel = () => {
    setTagName("");
    setDiscordChannel("");
    setCurrentNum(null);
    setColour("");
    setEndMessage("");
    setEndMessageRoleIds([]);
    setEndMessagePing(false);
    setEndMessageSelfAssign(false);
    setPersistent(true);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="550px"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <Dialog.Title>{isEditing ? "Edit Tag" : "Create New Tag"}</Dialog.Title>
        <Dialog.Description>
          {isEditing
            ? "Edit the tag settings."
            : "Create a new tag for categorising polls."}
        </Dialog.Description>

        <Flex gap="4" direction="column" mt="4">
          {/* Required Fields */}
          <Flex gap="2" direction="column">
            <Text size="2" weight="medium">
              Tag Name *
            </Text>
            <TextField.Root
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
            />
          </Flex>

          <Flex gap="2" direction="column">
            <Text size="2" weight="medium">
              Discord Channel *
            </Text>
            <ChannelSelect
              value={discordChannel}
              onValueChange={setDiscordChannel}
              placeholder="Select a channel for this tag..."
              disabled={isEditing}
              existingChannelUsage={existingChannels}
            />
          </Flex>

          {/* Optional Fields */}
          <Text size="3" weight="medium" mt="2">
            Optional Settings
          </Text>

          <Flex gap="2" direction="column">
            <Text size="2" weight="medium">
              Starting Number
            </Text>
            <TextField.Root
              type="number"
              value={currentNum?.toString() || ""}
              onChange={(e) =>
                setCurrentNum(e.target.value ? parseInt(e.target.value) : null)
              }
              placeholder="Starting value for poll numbering"
            />
          </Flex>

          <Flex gap="2" direction="column">
            <Text size="2" weight="medium">
              Color
            </Text>
            <TextField.Root
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              placeholder="Hex color code (e.g. #7298da)"
            />
          </Flex>

          <Flex gap="2" direction="column">
            <Text size="2" weight="medium">
              End Message
            </Text>
            <EndMessageSelect
              value={endMessage}
              onValueChange={setEndMessage}
              placeholder="Select an existing end message..."
              existingEndMessages={existingEndMessages}
            />
            <Text size="1" color="gray">
              Or type a custom message:
            </Text>
            <TextArea
              value={endMessage}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setEndMessage(e.target.value)
              }
              placeholder="Message to send after each poll"
              rows={3}
            />
          </Flex>

          <Flex gap="2" direction="column">
            <Text size="2" weight="medium">
              Ping Role IDs
            </Text>
            <RoleSelect
              value={endMessageRoleIds}
              onValueChange={setEndMessageRoleIds}
              placeholder="Select roles to ping and self-assign"
              existingRoleUsage={existingRoles}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              Role Options
            </Text>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: hasRoles ? 1 : 0.5,
              }}
            >
              <Checkbox
                checked={endMessagePing}
                disabled={!hasRoles}
                onCheckedChange={(checked) =>
                  setEndMessagePing(checked as boolean)
                }
              />
              <Text size="2">Ping the roles after each poll</Text>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: hasRoles ? 1 : 0.5,
              }}
            >
              <Checkbox
                checked={endMessageSelfAssign}
                disabled={!hasRoles}
                onCheckedChange={(checked) =>
                  setEndMessageSelfAssign(checked as boolean)
                }
              />
              <Text size="2">
                Let users self-assign the ping roles with a button
              </Text>
            </label>

            <label
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Checkbox
                checked={persistent}
                onCheckedChange={(checked) => setPersistent(checked as boolean)}
              />
              <Text size="2">
                Share end-message sending/deletion with other tags in the same
                channel
              </Text>
            </label>
          </Flex>

          <Flex gap="3" mt="6" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={handleCancel}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleSubmit}
              disabled={!tagName.trim() || !discordChannel.trim()}
            >
              {isEditing ? "Save Changes" : "Create Tag"}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
