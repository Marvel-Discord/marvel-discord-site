import type { Poll } from "@jocasta-polls-api";

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function datesEqual(a: Date | null, b: Date | null): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return a.getTime() === b.getTime();
}

export function pollFieldsEqual(a: Poll, b: Poll): boolean {
  return (
    a.question.trim() === b.question.trim() &&
    (a.description ?? "") === (b.description ?? "") &&
    (a.image?.trim() ?? "") === (b.image?.trim() ?? "") &&
    a.tag === b.tag &&
    arraysEqual(a.choices, b.choices) &&
    datesEqual(a.time, b.time) &&
    (a.thread_question ?? "") === (b.thread_question ?? "")
  );
}
