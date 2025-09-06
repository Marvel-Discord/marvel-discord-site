import { Button, Card, Flex, Text } from "@radix-ui/themes";
import { PencilIcon, Tag, TriangleAlert, Edit } from "lucide-react";
import styled from "styled-components";
import type { Poll } from "@jocasta-polls-api";
import { useTagContext } from "@/contexts/TagContext";
import { useState } from "react";
import { TagDialog } from "../forms/tagDialog";
import type { Tag as TagType } from "@jocasta-polls-api";

// Extended interface for form data (matches tagDialog.tsx)
interface TagFormData extends Partial<TagType> {
  // All fields are optional for form data
}

const CardStyle = styled(Card)`
  width: fit-content;
  z-index: 1000;

  --card-background-color: var(--gray-4);
`;

const ButtonStyle = styled(Button)`
  transition: background-color 0.2s ease-in-out;
  transition: color 0.2s ease-in-out;
`;

const StyledHeader = styled.h1`
  align-items: center;
  display: flex;
  gap: 0.3rem;
  font-size: var(--font-size-4);
`;

const TagHeader = styled(StyledHeader)``;

const ErrorHeader = styled(StyledHeader)`
  color: var(--red-11);
`;

const ErrorPollHeader = styled.h1`
  font-size: var(--font-size-2);
`;

const StyledText = styled(Text)`
  font-size: var(--font-size-1);
`;

interface EditButtonProps {
  editModeEnabled: boolean;
  setEditModeEnabled: (enabled: boolean) => void;
  hasChanges?: boolean;
  text?: string;
  canSave?: boolean;
  validationErrors?: Map<Poll, string[]>;
}

export default function EditButton({
  editModeEnabled,
  setEditModeEnabled,
  hasChanges = false,
  text,
  canSave = true,
  validationErrors = new Map(),
}: EditButtonProps) {
  const {
    pendingTags: newTags,
    updatePendingTag,
    clearPendingTags,
  } = useTagContext();
  const [editingTag, setEditingTag] = useState<TagFormData | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);

  const handleDiscardChanges = () => {
    clearPendingTags();
    setEditModeEnabled(false);
  };

  if (!editModeEnabled) {
    return (
      <Button
        variant="surface"
        size="2"
        aria-label="Edit Poll"
        onClick={() => setEditModeEnabled(true)}
      >
        <PencilIcon size={20} />
        Edit mode
      </Button>
    );
  }

  return (
    <Flex align={"end"} gap="2" direction="column">
      {newTags.length > 0 && (
        <CardStyle>
          <Flex direction="column" gap="1">
            <TagHeader>
              <Tag size={18} />
              Tags to create
            </TagHeader>
            {newTags.map((tag) => (
              <Flex key={tag.tag} align="center" gap="2">
                <Button
                  variant="ghost"
                  size="1"
                  onClick={() => {
                    setEditingTag(tag);
                    setTagDialogOpen(true);
                  }}
                >
                  <Edit size={14} />
                </Button>
                <StyledText>{tag.name}</StyledText>
              </Flex>
            ))}
          </Flex>
        </CardStyle>
      )}
      {validationErrors.size > 0 && (
        <CardStyle>
          <Flex direction="column" gap="1">
            <ErrorHeader>
              <TriangleAlert size={18} />
              Validation errors
            </ErrorHeader>
            {Array.from(validationErrors.entries()).flatMap(
              ([erroredPoll, errors]) => (
                <Flex key={erroredPoll.id} direction="column" gap="0.5">
                  <ErrorPollHeader>
                    {erroredPoll.question?.trim()
                      ? erroredPoll.question.trim()
                      : erroredPoll.id < 0
                      ? "New poll"
                      : `Poll ${erroredPoll.id}`}
                  </ErrorPollHeader>
                  {errors.map((error: string, index: number) => (
                    <StyledText key={`${erroredPoll.id}-${index}`}>
                      {error}
                    </StyledText>
                  ))}
                </Flex>
              )
            )}
          </Flex>
        </CardStyle>
      )}
      <CardStyle>
        <Flex gap="2" align="center">
          {text && <Text>{text}</Text>}
          <ButtonStyle
            variant="surface"
            size="2"
            aria-label="Discard changes"
            onClick={handleDiscardChanges}
          >
            Discard changes
          </ButtonStyle>
          <ButtonStyle
            variant={hasChanges && canSave ? "solid" : "surface"}
            color="green"
            size="2"
            aria-label="Save changes"
            disabled={!hasChanges || !canSave}
            onClick={() => setEditModeEnabled(false)}
          >
            Save changes
          </ButtonStyle>
        </Flex>
      </CardStyle>
      <TagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        onTagCreated={(updatedTag) => {
          if (editingTag && editingTag.tag !== undefined) {
            updatePendingTag(editingTag.tag, updatedTag);
          }
          setEditingTag(null);
        }}
        editingTag={editingTag}
      />
    </Flex>
  );
}
