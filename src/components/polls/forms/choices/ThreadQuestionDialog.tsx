import React, { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  Text,
  Flex,
  Button,
  Checkbox,
} from "@radix-ui/themes";
import styled from "styled-components";
import type { Poll } from "@jocasta-polls-api";

// Styled components
const StyledDialogContent = styled(Dialog.Content)`
  max-height: 90vh;
  max-width: 500px;
  overflow-y: auto;
`;

const FormContainer = styled(Flex).attrs({
  gap: "2",
  direction: "column",
})``;

const FieldContainer = styled(Flex).attrs({
  gap: "2",
  direction: "column",
})``;

const FieldLabel = styled(Text).attrs({
  size: "2",
  weight: "bold",
})``;

const ReadOnlyText = styled(Text).attrs({
  size: "2",
})<{ $isDefault?: boolean }>`
  align-items: center;
  background-color: var(--gray-a3);
  border-radius: var(--radius-2);
  color: ${({ $isDefault }) => ($isDefault ? "var(--gray-a11)" : "inherit")};
  display: flex;
  font-style: ${({ $isDefault }) => ($isDefault ? "italic" : "normal")};
  min-height: 2.5rem;
  padding: 0.5rem;
`;

const CheckboxContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  font-size: var(--font-size-2);
  gap: 0.5rem;
  letter-spacing: var(--letter-spacing-2);
  line-height: var(--line-height-2);
`;

const StyledCheckbox = styled(Checkbox)`
  cursor: pointer;
`;

const ActionButtonsContainer = styled(Flex).attrs({
  gap: "2",
  justify: "end",
  mt: "4",
})``;

const CancelButton = styled(Button).attrs({
  variant: "soft",
  color: "gray",
})``;

const SubmitButton = styled(Button).attrs({
  variant: "solid",
})``;

interface ThreadQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
  editable: boolean;
  onThreadQuestionChange?: (threadQuestion: string) => void;
}

export function ThreadQuestionDialog({
  open,
  onOpenChange,
  poll,
  editable,
  onThreadQuestionChange,
}: ThreadQuestionDialogProps) {
  const initialIsDefault = (poll.thread_question || "").toLowerCase() === "def";
  const [threadQuestion, setThreadQuestion] = useState(
    poll.thread_question || ""
  );
  const [isDefault, setIsDefault] = useState(initialIsDefault);
  const [previousText, setPreviousText] = useState(
    initialIsDefault ? "" : poll.thread_question || ""
  );

  // Update isDefault when threadQuestion changes to "def"
  useEffect(() => {
    if (threadQuestion.toLowerCase() === "def" && !isDefault) {
      setIsDefault(true);
    }
  }, [threadQuestion, isDefault]);

  const handleThreadQuestionChange = (value: string) => {
    // Only update previousText if we're not currently in default mode
    if (!isDefault && value.toLowerCase() !== "def") {
      setPreviousText(value);
    }
    setThreadQuestion(value);
  };

  const handleDefaultToggle = (checked: boolean) => {
    if (checked) {
      // Save current text before switching to default
      setPreviousText(threadQuestion);
      setThreadQuestion("def");
    } else {
      // Restore previous text when unchecking
      setThreadQuestion(previousText);
    }
    setIsDefault(checked);
  };

  const handleCancel = () => {
    setThreadQuestion(poll.thread_question || "");
    onOpenChange(false);
  };

  const handleSave = () => {
    if (onThreadQuestionChange) {
      onThreadQuestionChange(threadQuestion);
    }
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && editable) {
      handleSave();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <StyledDialogContent>
        <FormContainer>
          <FieldContainer>
            <FieldLabel>Thread Question</FieldLabel>
            {editable ? (
              <>
                <TextField.Root
                  value={isDefault ? "Default question" : threadQuestion}
                  onChange={(e) => handleThreadQuestionChange(e.target.value)}
                  placeholder="Enter the thread question..."
                  onKeyDown={handleKeyDown}
                  disabled={isDefault}
                />
                <CheckboxContainer
                  onClick={() => handleDefaultToggle(!isDefault)}
                >
                  <StyledCheckbox
                    checked={isDefault}
                    onCheckedChange={handleDefaultToggle}
                  />
                  Use default thread question
                </CheckboxContainer>
              </>
            ) : (
              <ReadOnlyText
                $isDefault={
                  (poll.thread_question || "").toLowerCase() === "def"
                }
              >
                {(poll.thread_question || "").toLowerCase() === "def"
                  ? "Default thread question"
                  : poll.thread_question || "No thread question set"}
              </ReadOnlyText>
            )}
          </FieldContainer>

          {editable && (
            <ActionButtonsContainer>
              <Dialog.Close>
                <CancelButton onClick={handleCancel}>Cancel</CancelButton>
              </Dialog.Close>
              <SubmitButton onClick={handleSave}>Save</SubmitButton>
            </ActionButtonsContainer>
          )}
        </FormContainer>
      </StyledDialogContent>
    </Dialog.Root>
  );
}
