import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDraft } from "@/hooks/useDraft";

type Item = { a: number; b: string };
const equal = (x: Item, y: Item) => x.a === y.a && x.b === y.b;
const initial: Item = { a: 1, b: "x" };

describe("useDraft", () => {
  it("initializes draft to initial value", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    expect(result.current.draft).toEqual(initial);
  });

  it("is not dirty initially", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    expect(result.current.dirty).toBe(false);
  });

  it("updates a single field via setField", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    act(() => result.current.setField("a", 2));
    expect(result.current.draft.a).toBe(2);
    expect(result.current.draft.b).toBe("x");
  });

  it("marks dirty after a change", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    act(() => result.current.setField("a", 2));
    expect(result.current.dirty).toBe(true);
  });

  it("clears dirty when field is set back to initial value", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    act(() => result.current.setField("a", 2));
    expect(result.current.dirty).toBe(true);
    act(() => result.current.setField("a", 1));
    expect(result.current.dirty).toBe(false);
  });

  it("reset() restores the initial value", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    act(() => result.current.setField("a", 99));
    act(() => result.current.reset());
    expect(result.current.draft).toEqual(initial);
    expect(result.current.dirty).toBe(false);
  });

  it("reset(newInitial) updates the baseline and draft", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    const next: Item = { a: 5, b: "z" };
    act(() => result.current.reset(next));
    expect(result.current.draft).toEqual(next);
    expect(result.current.dirty).toBe(false);
    act(() => result.current.setField("a", 5));
    expect(result.current.dirty).toBe(false);
  });

  it("setDraft accepts a value", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    act(() => result.current.setDraft({ a: 7, b: "q" }));
    expect(result.current.draft).toEqual({ a: 7, b: "q" });
    expect(result.current.dirty).toBe(true);
  });

  it("setDraft accepts an updater function", () => {
    const { result } = renderHook(() => useDraft(initial, equal));
    act(() => result.current.setDraft((prev) => ({ ...prev, b: "y" })));
    expect(result.current.draft.b).toBe("y");
    expect(result.current.dirty).toBe(true);
  });
});
