import type { Poll } from "@jocasta-polls-api";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePoll(
  poll: Poll,
  originalPoll?: Poll
): ValidationResult {
  const errors: string[] = [];

  // Check if title (question) is present and not empty
  if (!poll.question || poll.question.trim() === "") {
    errors.push("Title is required");
  }

  // Check if there's at least one choice
  if (!poll.choices || poll.choices.length === 0) {
    errors.push("At least one choice is required");
  } else {
    // Check for gaps in choices - if choice N has a value, all choices < N must also have values
    let hasGaps = false;
    let foundEmptyChoice = false;

    for (let i = 0; i < poll.choices.length; i++) {
      const choice = poll.choices[i];
      const isEmpty = !choice || choice.trim() === "";

      if (isEmpty) {
        foundEmptyChoice = true;
      } else if (foundEmptyChoice) {
        // Found a non-empty choice after an empty one - this is a gap
        hasGaps = true;
        break;
      }
    }

    if (hasGaps) {
      errors.push("All choices before the last filled choice must have text");
    }

    // Check if there's at least one non-empty choice
    const nonEmptyChoices = poll.choices.filter(
      (choice) => choice && choice.trim() !== ""
    );

    if (nonEmptyChoices.length === 0) {
      errors.push("At least one choice with text is required");
    }

    // For published polls, validate that choice count hasn't changed
    if (poll.published && originalPoll && originalPoll.choices) {
      const originalNonEmptyChoices = originalPoll.choices.filter(
        (choice) => choice && choice.trim() !== ""
      );
      if (nonEmptyChoices.length !== originalNonEmptyChoices.length) {
        errors.push("Cannot change the number of choices for a published poll");
      }
    }
  }

  // Check if a tag is selected (tag should not be 0 or null)
  if (!poll.tag || poll.tag === 0) {
    errors.push("A tag must be selected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePolls(
  polls: Poll[],
  originalPolls?: Poll[]
): ValidationResult {
  const allErrors: string[] = [];
  let hasInvalidPolls = false;

  for (const poll of polls) {
    // Find the original poll for comparison
    const originalPoll = originalPolls?.find((op) => op.id === poll.id);
    const result = validatePoll(poll, originalPoll);
    if (!result.isValid) {
      hasInvalidPolls = true;
      // Add poll-specific errors with poll identifier
      const pollIdentifier = poll.question?.trim()
        ? `"${poll.question.trim()}"`
        : poll.id < 0
        ? "New poll"
        : `Poll ${poll.id}`;
      result.errors.forEach((error) => {
        allErrors.push(`${pollIdentifier}: ${error}`);
      });
    }
  }

  return {
    isValid: !hasInvalidPolls,
    errors: allErrors,
  };
}
