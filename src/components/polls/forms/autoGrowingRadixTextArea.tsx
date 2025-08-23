import { TextArea, type TextAreaProps } from "@radix-ui/themes";
import { forwardRef, useEffect, useRef } from "react";
import styled from "styled-components";

export const AutoGrowingRadixTextArea = forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>(({ className, value, ...props }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);

  const setRef = (node: HTMLTextAreaElement) => {
    internalRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.RefObject<HTMLTextAreaElement>).current = node;
    }
  };

  function autoHeight() {
    const el = internalRef.current;
    if (el) {
      el.style.height = "0px";
      el.style.height = `${el.scrollHeight}px`;
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Update on value change
  useEffect(() => {
    autoHeight();
  }, [value]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: On load
  useEffect(() => {
    requestAnimationFrame(() => {
      autoHeight();
    });
  }, []);

  return (
    <TextArea ref={setRef} value={value} className={className} {...props} />
  );
});

AutoGrowingRadixTextArea.displayName = "AutoGrowingRadixTextArea";

export const AutoGrowingTextAreaStyled = styled(AutoGrowingRadixTextArea)`
  background: transparent;
  border: none;
  box-shadow: none;
  outline-offset: 0.1rem;
  padding: 0;
  width: 100%;

  > textarea {
    line-height: normal;
    text-indent: 0;
    padding: 0;
  }
`;
