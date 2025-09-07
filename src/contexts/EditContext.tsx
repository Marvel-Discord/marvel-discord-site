"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import { EditState } from "@/types/states";
import { emptyPoll, validatePolls, type ValidationResult } from "@/utils/polls";
import { createPolls, updatePolls, deletePolls } from "@/api/polls/polls";
import { useTagContext } from "@/contexts/TagContext";
import { usePollRefetch } from "@/contexts/PollRefetchContext";
import type { Poll } from "@jocasta-polls-api";
import config from "@/app/config/config";

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
  saveEditedPolls: () => Promise<{ success: boolean; message?: string }>;

  // Computed values
  hasChanges: boolean;
  canSave: boolean;
  changesSummary: string | undefined;
  isSaving: boolean;

  // Helpers
  isPollEditable: (poll: Poll) => boolean;
}

const EditContext = createContext<EditContextType | null>(null);

export function useEditContext() {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error("useEditContext must be used within EditProvider");
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
  const [isSaving, setIsSaving] = useState(false);

  const { pendingTags, createNewTag, clearPendingTags } = useTagContext();
  const { triggerRefetch } = usePollRefetch();

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

  const handleEditChange = useCallback(
    (poll: Poll, state: EditState) => {
      setEditedPolls((prev) => {
        const alreadyEdited = prev.find((p) => p.poll.id === poll.id);
        if (state === EditState.NONE) {
          return alreadyEdited
            ? prev.filter((p) => p.poll.id !== poll.id)
            : prev;
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
    },
    [debouncedValidation]
  );

  const addNewPoll = useCallback(() => {
    const newPoll = emptyPoll();
    setEditedPolls((prev) => [
      { poll: newPoll, state: EditState.CREATE },
      ...prev,
    ]);
  }, []);

  const isPollEditable = useCallback(
    (poll: Poll) => {
      return editModeEnabled && poll.guild_id.toString() === config.guildId;
    },
    [editModeEnabled]
  );

  const saveEditedPolls = useCallback(async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (editedPolls.length === 0 && pendingTags.length === 0) {
      return { success: true, message: "No changes to save" };
    }

    setIsSaving(true);

    try {
      // First, create any pending tags
      const createdTags = [];
      const tagIdMapping = new Map<number, number>(); // Maps negative ID to positive ID

      for (const pendingTag of pendingTags) {
        if (pendingTag.name && pendingTag.channel_id) {
          // Build a complete tag object from the partial
          const completeTagData = {
            name: pendingTag.name,
            guild_id: pendingTag.guild_id || BigInt(config.guildId),
            channel_id: pendingTag.channel_id,
            crosspost_channels: pendingTag.crosspost_channels || [],
            crosspost_servers: pendingTag.crosspost_servers || [],
            current_num: pendingTag.current_num || null,
            colour: pendingTag.colour || null,
            end_message: pendingTag.end_message || null,
            end_message_role_ids: pendingTag.end_message_role_ids || [],
            end_message_ping: pendingTag.end_message_ping || false,
            end_message_self_assign:
              pendingTag.end_message_self_assign || false,
            end_message_replace: pendingTag.end_message_replace || false,
            end_message_latest_ids: pendingTag.end_message_latest_ids || [],
            persistent:
              pendingTag.persistent !== undefined
                ? pendingTag.persistent
                : true,
          };

          const result = await createNewTag(completeTagData);
          if (result.success && result.tag) {
            createdTags.push(result.tag);
            // Map the temporary negative ID to the real positive ID
            if (pendingTag.tag && result.tag.tag) {
              tagIdMapping.set(pendingTag.tag, result.tag.tag);
            }
          } else {
            throw new Error(`Failed to create tag: ${result.message}`);
          }
        }
      }

      // Separate polls by action type
      const pollsToCreate = editedPolls
        .filter((ep) => ep.state === EditState.CREATE)
        .map((ep) => {
          const { id, ...pollWithoutId } = ep.poll;

          // Update tag ID if it was a newly created tag
          const updatedTag = tagIdMapping.has(pollWithoutId.tag)
            ? tagIdMapping.get(pollWithoutId.tag)!
            : pollWithoutId.tag;

          return {
            ...pollWithoutId,
            tag: updatedTag,
          };
        });

      const pollsToUpdate = editedPolls
        .filter((ep) => ep.state === EditState.UPDATE)
        .map((ep) => ep.poll);

      const pollsToDelete = editedPolls
        .filter((ep) => ep.state === EditState.DELETE)
        .map((ep) => ep.poll.id.toString());

      // Execute API calls
      const promises = [];

      if (pollsToCreate.length > 0) {
        promises.push(createPolls(pollsToCreate));
      }

      if (pollsToUpdate.length > 0) {
        promises.push(updatePolls(pollsToUpdate));
      }

      if (pollsToDelete.length > 0) {
        promises.push(deletePolls(pollsToDelete));
      }

      await Promise.all(promises);

      // Clear edited state after successful save
      setEditedPolls([]);
      clearPendingTags();

      // Trigger refetch of polls
      triggerRefetch();

      const successMessage = [];
      if (createdTags.length > 0) {
        successMessage.push(
          `${createdTags.length} tag${
            createdTags.length > 1 ? "s" : ""
          } created`
        );
      }
      if (editedPolls.length > 0) {
        successMessage.push("polls saved");
      }

      return {
        success: true,
        message:
          successMessage.length > 0
            ? `${successMessage.join(" and ")} successfully!`
            : "Changes saved successfully!",
      };
    } catch (error) {
      console.error("Failed to save changes:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to save changes",
      };
    } finally {
      setIsSaving(false);
    }
  }, [editedPolls, pendingTags, createNewTag, clearPendingTags]);

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
  const hasChanges = editedPolls.length > 0 || pendingTags.length > 0;
  const canSave = validationResult.isValid;

  const changesSummary = useMemo(() => {
    if (editedPolls.length === 0 && pendingTags.length === 0) return undefined;

    const tallyPollsCreated = editedPolls.filter(
      (editedPoll) => editedPoll.state === EditState.CREATE
    );
    const tallyPollsUpdated = editedPolls.filter(
      (editedPoll) => editedPoll.state === EditState.UPDATE
    );
    const tallyPollsDeleted = editedPolls.filter(
      (editedPoll) => editedPoll.state === EditState.DELETE
    );

    const formatCount = (count: number, label: string) =>
      count > 0 ? `${count} ${label}${count === 1 ? "" : "s"}` : null;

    const changes = [
      formatCount(tallyPollsCreated.length, "poll created"),
      formatCount(tallyPollsUpdated.length, "poll updated"),
      formatCount(tallyPollsDeleted.length, "poll deleted"),
      formatCount(pendingTags.length, "tag created"),
    ].filter(Boolean);

    return changes.join(", ");
  }, [editedPolls, pendingTags]);

  const value: EditContextType = {
    editModeEnabled,
    editablePolls,
    editedPolls,
    validationResult,
    setEditModeEnabled,
    handleEditChange,
    addNewPoll,
    validatePolls: validateCurrentPolls,
    saveEditedPolls,
    hasChanges,
    canSave,
    changesSummary,
    isSaving,
    isPollEditable,
  };

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}
