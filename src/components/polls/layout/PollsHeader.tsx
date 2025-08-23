import React from "react";
import { FixedPositionContainer } from "./fixedPositionContainer";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useEditContext } from "@/contexts/EditContext";
import EditButton from "../ui/editButton";
import ScrollToTopButton from "../ui/scrollToTop";

export function PollsHeader() {
  const { user } = useAuthContext();
  const {
    editModeEnabled,
    setEditModeEnabled,
    hasChanges,
    canSave,
    validationResult,
    changesSummary,
  } = useEditContext();

  const canEdit = user?.isManager ?? false;

  return (
    <FixedPositionContainer>
      <ScrollToTopButton />
      {canEdit && (
        <EditButton
          editModeEnabled={editModeEnabled}
          setEditModeEnabled={setEditModeEnabled}
          hasChanges={hasChanges}
          canSave={canSave}
          validationErrors={validationResult.errors}
          text={changesSummary}
        />
      )}
    </FixedPositionContainer>
  );
}
