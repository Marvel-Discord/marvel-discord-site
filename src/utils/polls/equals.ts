import type { Poll } from "@/types/jocasta";

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function toMs(value: Date | string): number {
  return typeof value === "string" ? Date.parse(value) : value.getTime();
}

function datesEqual(a: Date | null, b: Date | null): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  // The Poll type claims `time: Date | null`, but JSON deserialization yields
  // ISO strings at runtime. Accept both so the comparison doesn't crash.
  return toMs(a as Date | string) === toMs(b as Date | string);
}

function descriptionsEqual(a: string | null, b: string | null): boolean {
  // The art-tag regex has an optional trailing period (`\.?`), but the dialog
  // reconstruction always appends one. Strip trailing whitespace + periods so
  // a revert round-trip doesn't stay dirty forever.
  const normalize = (s: string | null) => (s ?? "").trim().replace(/\.+$/, "");
  return normalize(a) === normalize(b);
}

export function pollFieldsEqual(a: Poll, b: Poll): boolean {
  return (
    a.question.trim() === b.question.trim() &&
    descriptionsEqual(a.description, b.description) &&
    (a.image?.trim() ?? "") === (b.image?.trim() ?? "") &&
    a.tag === b.tag &&
    arraysEqual(a.choices, b.choices) &&
    datesEqual(a.time, b.time) &&
    (a.thread_question ?? "") === (b.thread_question ?? "")
  );
}
