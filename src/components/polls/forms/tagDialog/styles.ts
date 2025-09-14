import {
  Button,
  Flex,
  Text,
  Dialog,
  TextField,
  TextArea,
  Checkbox,
} from "@radix-ui/themes";
import styled from "styled-components";

// Dialog styles
export const StyledDialogContent = styled(Dialog.Content)`
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
`;

export const StyledDialogTitle = styled(Dialog.Title)`
  margin-bottom: 0.5rem;
`;

export const StyledDialogDescription = styled(Dialog.Description)`
  margin-bottom: 1rem;
`;

// Form layout styles
export const FormContainer = styled(Flex).attrs({
  gap: "4",
  direction: "column",
  mt: "4",
})``;

export const FieldContainer = styled(Flex).attrs({
  gap: "2",
  direction: "column",
})``;

export const RequiredFieldsContainer = styled(Flex).attrs({
  gap: "2",
  direction: "column",
})``;

export const OptionalFieldsContainer = styled(Flex).attrs({
  gap: "2",
  direction: "column",
})``;

export const SectionTitle = styled(Text).attrs({
  size: "3",
  weight: "medium",
  mt: "2",
})``;

// Field styles
export const FieldLabel = styled(Text).attrs({
  size: "2",
  weight: "medium",
})``;

export const RequiredIndicator = styled.span`
  color: var(--red-9);
`;

export const StyledTextField = styled(TextField.Root)``;

export const StyledTextArea = styled(TextArea)``;

// Color picker styles
export const ColorPickerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  width: 100%;
`;

export const ColorPickerButton = styled(Button)`
  &:hover {
    opacity: 0.8;
  }
`;

export const ColorTextField = styled(TextField.Root)`
  font-family: monospace;
`;

// Role options styles
export const TagOptionsContainer = styled(Flex).attrs({
  direction: "column",
  gap: "2",
})``;

export const TagOptionLabel = styled.label<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
`;

export const StyledCheckbox = styled(Checkbox)``;

// Action buttons
export const ActionButtonsContainer = styled(Flex).attrs({
  gap: "3",
  mt: "6",
  justify: "end",
})``;

export const CancelButton = styled(Button).attrs({
  variant: "soft",
  color: "gray",
})``;

export const SubmitButton = styled(Button)``;

// Helper text styles
export const HelperText = styled(Text).attrs({
  size: "1",
  color: "gray",
})``;

export const PlaceholderText = styled(Text).attrs({
  size: "1",
  color: "gray",
})`
  font-style: italic;
  padding: 8px 0;
`;
