import { useState } from "react";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import type { Tag } from "@jocasta-polls-api";

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagCreated: (tag: Tag) => void;
}

export function CreateTagDialog({
  open,
  onOpenChange,
  onTagCreated,
}: CreateTagDialogProps) {
  const [tagName, setTagName] = useState("");

  const handleSubmit = () => {
    if (!tagName.trim()) return;

    // Create a temporary tag with a negative ID to indicate it's pending creation
    const newTag = {
      tag: -Date.now(), // negative ID to indicate it's pending
      name: tagName.trim(),
      channel_id: BigInt(0),
      colour: null,
    } as Tag;

    onTagCreated(newTag);
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
        <Dialog.Title>Create New Tag</Dialog.Title>
        <Dialog.Description>
          Create a new tag for organizing polls.
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
              Create Tag
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
