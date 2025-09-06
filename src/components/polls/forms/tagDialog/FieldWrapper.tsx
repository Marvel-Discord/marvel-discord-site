import { ReactNode } from "react";
import {
  FieldContainer,
  FieldLabel,
  RequiredIndicator,
  HelperText,
} from "./styles";

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  helperText?: string;
  children: ReactNode;
}

export function FieldWrapper({
  label,
  required = false,
  helperText,
  children,
}: FieldWrapperProps) {
  return (
    <FieldContainer>
      <FieldLabel>
        {label}
        {required && <RequiredIndicator> *</RequiredIndicator>}
      </FieldLabel>
      {children}
      {helperText && <HelperText>{helperText}</HelperText>}
    </FieldContainer>
  );
}
