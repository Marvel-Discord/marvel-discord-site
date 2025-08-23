"use client";

import { createContext, useContext, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { EditState } from '@/types/states';
import { emptyPoll, validatePolls, type ValidationResult } from '@/utils/polls';
import type { Poll } from '@jocasta-polls-api';

interface EditedPoll {
  poll: Poll;
  state: EditState;
}

interface EditContextType {
  // State
  editModeEnabled: boolean;
  editablePolls: Poll[];
  editedPolls: EditedPoll[];
  validationResult: ValidationResult;
  
  // Actions
  setEditModeEnabled: (enabled: boolean) => void;
  handleEditChange: (poll: Poll, state: EditState) => void;
  addNewPoll: () => void;
  validatePolls: () => void;
  
  // Computed values
  hasChanges: boolean;
  canSave: boolean;
  changesSummary: string | undefined;
  
  // Helpers
  isPollEditable: (poll: Poll) => boolean;
}

const EditContext = createContext<EditContextType | null>(null);

export function useEditContext() {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within EditProvider');
  }
  return context;
}

interface EditProviderProps {
  children: React.ReactNode;
  polls: Poll[];
  canEdit: boolean;
}

export function EditProvider({ children, polls }: EditProviderProps) {
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  const [editedPolls, setEditedPolls] = useState<EditedPoll[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: new Map(),
  });

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute editable polls based on current state instead of storing as state
  const editablePolls = useMemo(() => {
    if (!editModeEnabled) return [];
    
    const newPolls = polls.filter(
      (poll) =>
        !editedPolls.some((editablePoll) => editablePoll.poll.id === poll.id)
    );

    return [
      ...editedPolls.map((editablePoll) => editablePoll.poll),
      ...newPolls,
    ];
  }, [editModeEnabled, editedPolls, polls]);

  // Function to validate polls on demand
  const validateCurrentPolls = useCallback(() => {
    if (!editModeEnabled) {
      setValidationResult({ isValid: true, errors: new Map() });
      return;
    }

    // Validate all polls that are being edited (including new polls)
    const pollsToValidate = editablePolls.filter((poll) => {
      // Include new polls (negative IDs) or polls that are in the edited list
      return (
        poll.id < 0 || editedPolls.some((edited) => edited.poll.id === poll.id)
      );
    });

    if (pollsToValidate.length === 0) {
      setValidationResult({ isValid: true, errors: new Map() });
      return;
    }

    // Get original polls for comparison (for published poll validation)
    const originalPolls = polls.filter((poll) =>
      pollsToValidate.some((p) => p.id === poll.id)
    );

    const result = validatePolls(pollsToValidate, originalPolls);
    setValidationResult(result);
  }, [editModeEnabled, editablePolls, editedPolls, polls]);

  // Debounced validation to avoid lag during typing
  const debouncedValidation = useCallback(() => {
    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set new timeout
    validationTimeoutRef.current = setTimeout(() => {
      validateCurrentPolls();
    }, 1000);
  }, [validateCurrentPolls]);

  const handleEditChange = useCallback((poll: Poll, state: EditState) => {
    setEditedPolls((prev) => {
      const alreadyEdited = prev.find((p) => p.poll.id === poll.id);
      if (state === EditState.NONE) {
        return alreadyEdited ? prev.filter((p) => p.poll.id !== poll.id) : prev;
      }
      if (!alreadyEdited) {
        if (state === EditState.DELETE && poll.id < 0) {
          // For new polls being deleted, just remove from edited list
          return prev.filter((p) => p.poll.id !== poll.id);
        }
        return [...prev, { poll, state }];
      }
      // If already edited and it's a new poll being deleted, remove it completely
      if (state === EditState.DELETE && poll.id < 0) {
        return prev.filter((p) => p.poll.id !== poll.id);
      }
      // Update the existing entry
      return prev.map((p) => (p.poll.id === poll.id ? { poll, state } : p));
    });

    // Trigger debounced validation after changes
    debouncedValidation();
  }, [debouncedValidation]);

  const addNewPoll = useCallback(() => {
    const newPoll = emptyPoll();
    setEditedPolls((prev) => [{ poll: newPoll, state: EditState.CREATE }, ...prev]);
  }, []);

  const isPollEditable = useCallback((poll: Poll) => {
    return editModeEnabled && poll.guild_id.toString() === "281648235557421056";
  }, [editModeEnabled]);

  // Reset edit state when disabled
  useEffect(() => {
    if (!editModeEnabled) {
      setEditedPolls([]);
      setValidationResult({ isValid: true, errors: new Map() });
    }
  }, [editModeEnabled]);

  // Validate polls when entering edit mode
  useEffect(() => {
    if (editModeEnabled) {
      validateCurrentPolls();
    }
  }, [editModeEnabled, validateCurrentPolls]);

  // Cleanup validation timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Computed values
  const hasChanges = editedPolls.length > 0;
  const canSave = validationResult.isValid;
  
  const changesSummary = useMemo(() => {
    if (editedPolls.length === 0) return undefined;

    const tallyPollsCreated = editedPolls.filter((editedPoll) => editedPoll.state === EditState.CREATE);
    const tallyPollsUpdated = editedPolls.filter((editedPoll) => editedPoll.state === EditState.UPDATE);
    const tallyPollsDeleted = editedPolls.filter((editedPoll) => editedPoll.state === EditState.DELETE);
    
    const formatCount = (count: number, label: string) =>
      count > 0 ? `${count} poll${count === 1 ? "" : "s"} ${label}` : null;

    return [
      formatCount(tallyPollsCreated.length, "created"),
      formatCount(tallyPollsUpdated.length, "updated"),
      formatCount(tallyPollsDeleted.length, "deleted"),
    ]
      .filter(Boolean)
      .join(", ");
  }, [editedPolls]);

  const value: EditContextType = {
    editModeEnabled,
    editablePolls,
    editedPolls,
    validationResult,
    setEditModeEnabled,
    handleEditChange,
    addNewPoll,
    validatePolls: validateCurrentPolls,
    hasChanges,
    canSave,
    changesSummary,
    isPollEditable,
  };

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}
