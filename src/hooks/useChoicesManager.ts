import { useState, useEffect, useRef } from "react";
import type { Poll } from "@jocasta-polls-api";
import { useFirstRenderResetOnCondition } from "@/utils/useFirstRender";
import { MAX_CHOICES } from "@/components/polls/forms/choices/constants";

export function useChoicesManager({
  poll,
  editable,
  handleChoicesChange,
}: {
  poll: Poll;
  editable: boolean;
  handleChoicesChange: (choices: string[]) => void;
}) {
  const [choices, setChoices] = useState(() =>
    editable && poll.choices.length < MAX_CHOICES && !poll.published
      ? [...poll.choices, ""]
      : poll.choices
  );

  function handleChoiceTextChange(index: number, value: string) {
    if (!editable) return;
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    handleSetChoices(updatedChoices);
  }

  function handleChoiceDelete(index: number) {
    if (!editable) return;
    const updatedChoices = [...choices];
    updatedChoices.splice(index, 1);
    handleSetChoices(updatedChoices);
  }

  function handleSetChoices(newChoices: string[]) {
    if (!poll.published) {
      const last = newChoices.at(-1);
      const secondLast = newChoices.at(-2);

      if (
        (newChoices.length >= 1 &&
          last !== "" &&
          newChoices.length < MAX_CHOICES) ||
        newChoices.length === 0
      ) {
        newChoices.push("");
      } else if (newChoices.length >= 2 && secondLast === "") {
        newChoices.pop();
      }
    }

    setChoices(newChoices);
  }

  const isFirstRender = useFirstRenderResetOnCondition(editable);
  const prevChoicesRef = useRef<string[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleChoicesChange is from parent component, isFirstRender is a ref
  useEffect(() => {
    if (editable) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        prevChoicesRef.current = choices.filter(
          (choice) => choice.trim() !== ""
        );
        return;
      }

      const filteredChoices = choices.filter((choice) => choice.trim() !== "");

      // Only call handleChoicesChange if the choices actually changed
      if (
        JSON.stringify(filteredChoices) !==
        JSON.stringify(prevChoicesRef.current)
      ) {
        prevChoicesRef.current = filteredChoices;
        handleChoicesChange(filteredChoices);
      }
    }
  }, [editable, choices, handleChoicesChange]);

  return {
    choices,
    handleChoiceTextChange,
    handleChoiceDelete,
  };
}
