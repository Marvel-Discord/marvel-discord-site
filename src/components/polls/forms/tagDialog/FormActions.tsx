import { Dialog } from "@radix-ui/themes";
import { ActionButtonsContainer, CancelButton, SubmitButton } from "./styles";

interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSaving?: boolean;
}

export function FormActions({
  isEditing,
  onCancel,
  onSubmit,
  canSubmit,
  isSaving = false,
}: FormActionsProps) {
  return (
    <ActionButtonsContainer>
      <Dialog.Close>
        <CancelButton onClick={onCancel} disabled={isSaving}>
          Cancel
        </CancelButton>
      </Dialog.Close>
      <SubmitButton onClick={onSubmit} disabled={!canSubmit || isSaving}>
        {isSaving
          ? isEditing
            ? "Saving..."
            : "Creating..."
          : isEditing
          ? "Save Changes"
          : "Create Tag"}
      </SubmitButton>
    </ActionButtonsContainer>
  );
}
