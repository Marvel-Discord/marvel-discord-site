import { ChangeEvent } from "react";
import { Dialog, Text } from "@radix-ui/themes";
import { ChannelSelect } from "./channelSelect";
import { RoleSelect } from "./roleSelect";
import { EndMessageSelect } from "./endMessageSelect";
import {
  useTagForm,
  type TagFormData,
  ColorPicker,
  FieldWrapper,
  RoleOptions,
  FormActions,
  StyledDialogContent,
  StyledDialogTitle,
  StyledDialogDescription,
  FormContainer,
  RequiredFieldsContainer,
  OptionalFieldsContainer,
  SectionTitle,
  StyledTextField,
  StyledTextArea,
  HelperText,
} from "./tagDialog/";

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
  const {
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
  } = useTagForm({ editingTag, onTagCreated, onOpenChange });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleEndMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEndMessage(e.target.value);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <StyledDialogContent>
        <StyledDialogTitle>
          {isEditing ? "Edit Tag" : "Create New Tag"}
        </StyledDialogTitle>
        <StyledDialogDescription>
          {isEditing
            ? "Edit the tag settings."
            : "Create a new tag for categorising polls."}
        </StyledDialogDescription>

        <FormContainer>
          <RequiredFieldsContainer>
            <FieldWrapper label="Tag Name" required>
              <StyledTextField
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Enter tag name"
                onKeyDown={handleKeyDown}
              />
            </FieldWrapper>

            <FieldWrapper label="Discord Channel" required>
              <ChannelSelect
                value={discordChannel}
                onValueChange={setDiscordChannel}
                placeholder="Select a channel for this tag..."
                disabled={isEditing}
                existingChannelUsage={existingChannels}
              />
            </FieldWrapper>
          </RequiredFieldsContainer>

          <OptionalFieldsContainer>
            <SectionTitle>Optional</SectionTitle>

            <FieldWrapper
              label="Starting Number"
              helperText="Starting value for poll numbering. Empty to leave unnumbered."
            >
              <StyledTextField
                type="number"
                value={currentNum?.toString() || ""}
                onChange={(e) =>
                  setCurrentNum(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="Starting value for poll numbering"
              />
            </FieldWrapper>

            <FieldWrapper label="Color">
              <ColorPicker value={colour} onChange={setColour} />
            </FieldWrapper>

            <FieldWrapper label="End Message">
              <EndMessageSelect
                value={endMessage}
                onValueChange={setEndMessage}
                placeholder="Select an existing end message..."
                existingEndMessages={existingEndMessages}
              />
              <HelperText>Or type a custom message:</HelperText>
              <StyledTextArea
                value={endMessage}
                onChange={handleEndMessageChange}
                placeholder="Message to send after each poll"
                rows={3}
              />
            </FieldWrapper>

            <FieldWrapper label="Ping Role IDs">
              <RoleSelect
                value={endMessageRoleIds}
                onValueChange={setEndMessageRoleIds}
                placeholder="Select roles to ping and self-assign"
                existingRoleUsage={existingRoles}
              />
            </FieldWrapper>

            <FieldWrapper label="Role Options">
              <RoleOptions
                endMessageRoleIds={endMessageRoleIds}
                endMessagePing={endMessagePing}
                endMessageSelfAssign={endMessageSelfAssign}
                persistent={persistent}
                onEndMessagePingChange={setEndMessagePing}
                onEndMessageSelfAssignChange={setEndMessageSelfAssign}
                onPersistentChange={setPersistent}
              />
            </FieldWrapper>
          </OptionalFieldsContainer>

          <FormActions
            isEditing={isEditing}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
          />
        </FormContainer>
      </StyledDialogContent>
    </Dialog.Root>
  );
}
