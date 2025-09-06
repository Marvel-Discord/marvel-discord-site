import { useState, useEffect } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import type { Tag } from "@jocasta-polls-api";

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagCreated: (tag: Tag) => void;
  editingTag?: Tag | null;
}

export function TagDialog({
  open,
  onOpenChange,
  onTagCreated,
  editingTag = null,
}: TagDialogProps) {
  const [tagName, setTagName] = useState("");
  const isEditing = editingTag !== null;

  // Update tagName when editingTag changes
  useEffect(() => {
    if (editingTag) {
      setTagName(editingTag.name);
    } else {
      setTagName("");
    }
  }, [editingTag]);

  const handleSubmit = () => {
    if (!tagName.trim()) return;

    const tag = isEditing
      ? { ...editingTag, name: tagName.trim() }
      : ({
          tag: -Date.now(), // negative ID to indicate it's pending
          name: tagName.trim(),
          channel_id: BigInt(0),
          colour: null,
        } as Tag);

    onTagCreated(tag);
    onOpenChange(false);

    // Reset form
    setTagName("");
  };

  const handleCancel = () => {
    setTagName("");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>{isEditing ? "Edit Tag" : "Create New Tag"}</Dialog.Title>
        <Dialog.Description>
          {isEditing
            ? "Edit the tag name."
            : "Create a new tag for organizing polls."}
        </Dialog.Description>

        <Flex gap="4" direction="column" mt="4">
          <Flex gap="2" direction="column">
            <Text size="2" weight="medium">
              Tag Name
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

          <Flex gap="3" mt="6" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={handleCancel}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleSubmit} disabled={!tagName.trim()}>
              {isEditing ? "Save Changes" : "Create Tag"}
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
