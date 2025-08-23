import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { PencilIcon, TriangleAlert } from "lucide-react";
import styled from "styled-components";
import type { Poll } from "@jocasta-polls-api";

const CardStyle = styled(Card)`
  width: fit-content;
  z-index: 1000;

  --card-background-color: var(--gray-4);
`;

const ButtonStyle = styled(Button)`
  transition: background-color 0.2s ease-in-out;
  transition: color 0.2s ease-in-out;
`;

const ErrorHeader = styled.h1`
  align-items: center;
  color: var(--red-11);
  display: flex;
  font-size: var(--font-size-4);
  gap: 0.2rem;
`;

const ErrorPollHeader = styled.h1`
  font-size: var(--font-size-2);
`;

const ErrorText = styled(Text)`
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
      {validationErrors.size > 0 && (
        <CardStyle>
          <Flex direction="column" gap="1">
            <ErrorHeader>
              <TriangleAlert size={18} />
              Validation Errors
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
                    <ErrorText key={`${erroredPoll.id}-${index}`}>
                      {error}
                    </ErrorText>
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
            onClick={() => setEditModeEnabled(false)}
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
    </Flex>
  );
}
