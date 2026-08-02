import { describe, it, expect } from "vitest";
import type { Poll } from "@/types/jocasta";
import { pollFieldsEqual } from "@/utils/polls/equals";

function basePoll(overrides: Partial<Poll> = {}): Poll {
  return {
    id: 1,
    question: "Best hero?",
    published: false,
    active: false,
    guild_id: BigInt(1),
    choices: ["Iron Man", "Thor"],
    votes: [],
    total_votes: 0,
    time: new Date("2026-08-01T12:00:00Z"),
    num: null,
    message_id: null,
    crosspost_message_ids: [],
    tag: 5,
    image: null,
    description: null,
    thread_question: null,
    show_question: true,
    show_options: true,
    show_voting: true,
    fallback: false,
    ...overrides,
  };
}

describe("pollFieldsEqual", () => {
  it("returns true for identical polls", () => {
    const a = basePoll();
    const b = basePoll();
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns false when question differs (ignoring surrounding whitespace)", () => {
    const a = basePoll({ question: "Best hero?" });
    const b = basePoll({ question: "  Best hero?  " });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns false when question text content differs", () => {
    const a = basePoll({ question: "Best hero?" });
    const b = basePoll({ question: "Best villain?" });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("treats null and empty description as equal", () => {
    const a = basePoll({ description: null });
    const b = basePoll({ description: "" });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns false when descriptions differ", () => {
    const a = basePoll({ description: "A" });
    const b = basePoll({ description: "B" });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("compares image with trimming", () => {
    const a = basePoll({ image: "http://x.png" });
    const b = basePoll({ image: "  http://x.png  " });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns false when tag differs", () => {
    const a = basePoll({ tag: 5 });
    const b = basePoll({ tag: 6 });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("returns true for same date with different references (KEY BUG FIX)", () => {
    const t = "2026-08-01T12:00:00Z";
    const a = basePoll({ time: new Date(t) });
    const b = basePoll({ time: new Date(t) });
    expect(a.time).not.toBe(b.time); // different references
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns false when date value differs", () => {
    const a = basePoll({ time: new Date("2026-08-01T12:00:00Z") });
    const b = basePoll({ time: new Date("2026-08-02T12:00:00Z") });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("returns false when one date is null and the other is not", () => {
    const a = basePoll({ time: null });
    const b = basePoll({ time: new Date("2026-08-01T12:00:00Z") });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("returns true when both dates are null", () => {
    const a = basePoll({ time: null });
    const b = basePoll({ time: null });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns true for same choices in different array references", () => {
    const a = basePoll({ choices: ["A", "B"] });
    const b = basePoll({ choices: ["A", "B"] });
    expect(a.choices).not.toBe(b.choices);
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns false when choice content differs", () => {
    const a = basePoll({ choices: ["A", "B"] });
    const b = basePoll({ choices: ["A", "C"] });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("returns false when choices length differs", () => {
    const a = basePoll({ choices: ["A", "B"] });
    const b = basePoll({ choices: ["A"] });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("treats null and empty thread_question as equal", () => {
    const a = basePoll({ thread_question: null });
    const b = basePoll({ thread_question: "" });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("compares ISO string dates (API reality) to Date objects of the same instant", () => {
    const iso = "2026-08-01T12:00:00Z";
    const a = basePoll({ time: iso as unknown as Date });
    const b = basePoll({ time: new Date(iso) });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("compares two ISO string dates of the same instant as equal", () => {
    const a = basePoll({ time: "2026-08-01T12:00:00Z" as unknown as Date });
    const b = basePoll({ time: "2026-08-01T12:00:00.000Z" as unknown as Date });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("returns false when one date is an ISO string and the other is a different instant", () => {
    const a = basePoll({ time: "2026-08-01T12:00:00Z" as unknown as Date });
    const b = basePoll({ time: new Date("2026-08-02T12:00:00Z") });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });

  it("treats descriptions as equal despite trailing-period asymmetry from the art-tag round-trip", () => {
    // e.g. original poll has "Art by Foo" (no period) but the dialog
    // reconstruction always appends one -> "Art by Foo."
    const a = basePoll({ description: "Best hero?\nArt by Foo" });
    const b = basePoll({ description: "Best hero?\nArt by Foo." });
    expect(pollFieldsEqual(a, b)).toBe(true);
  });

  it("still detects genuine description content differences after normalization", () => {
    const a = basePoll({ description: "Best hero?\nArt by Foo." });
    const b = basePoll({ description: "Best hero?\nArt by Bar." });
    expect(pollFieldsEqual(a, b)).toBe(false);
  });
});
