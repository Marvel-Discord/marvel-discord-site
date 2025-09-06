import { Dialog } from "@radix-ui/themes";
import { ActionButtonsContainer, CancelButton, SubmitButton } from "./styles";

interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function FormActions({
  isEditing,
  onCancel,
  onSubmit,
  canSubmit,
}: FormActionsProps) {
  return (
    <ActionButtonsContainer>
      <Dialog.Close>
        <CancelButton onClick={onCancel}>Cancel</CancelButton>
      </Dialog.Close>
      <SubmitButton onClick={onSubmit} disabled={!canSubmit}>
        {isEditing ? "Save Changes" : "Create Tag"}
      </SubmitButton>
    </ActionButtonsContainer>
  );
}
