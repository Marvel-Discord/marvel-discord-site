import type { Tag } from "@jocasta-polls-api";

// Extended type for form data (includes pending tag fields)
export type TagFormData = Partial<Tag>;

// Form field types
export interface TagFormFields {
  tagName: string;
  discordChannel: string;
  currentNum: number | null;
  colour: string;
  endMessage: string;
  endMessageRoleIds: string[];
  endMessagePing: boolean;
  endMessageSelfAssign: boolean;
  persistent: boolean;
}

// Usage counts for existing data
export interface ExistingUsageCounts {
  channels: Record<string, number>;
  roles: Record<string, number>;
  endMessages: Record<string, number>;
}

// Color picker component props
export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  placeholder?: string;
}

// Field wrapper component props
export interface FieldWrapperProps {
  label: string;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
}

// Role options component props
export interface RoleOptionsProps {
  endMessageRoleIds: string[];
  endMessagePing: boolean;
  endMessageSelfAssign: boolean;
  persistent: boolean;
  onEndMessagePingChange: (checked: boolean) => void;
  onEndMessageSelfAssignChange: (checked: boolean) => void;
  onPersistentChange: (checked: boolean) => void;
}

// Form actions component props
export interface FormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}
