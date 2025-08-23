import { TextField } from "@radix-ui/themes";
import type { RootProps } from "@radix-ui/themes/components/text-field";
import { forwardRef, useEffect, useRef, useState } from "react";
import styled from "styled-components";

export const AutoGrowingRadixInput = forwardRef<HTMLInputElement, RootProps>(
  ({ className, value = "", children, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const mirrorRef = useRef<HTMLSpanElement>(null);
    const [inputWidth, setInputWidth] = useState(1);

    const setRef = (node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.RefObject<HTMLInputElement>).current = node;
      }
    };

    const updateWidth = () => {
      const mirror = mirrorRef.current;
      if (mirror) {
        setInputWidth(mirror.offsetWidth); // add buffer for caret
      }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: Update on value change
    useEffect(() => {
      updateWidth();
    }, [value]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: On load
    useEffect(() => {
      requestAnimationFrame(() => {
        updateWidth();
      });
    }, []);

    return (
      <Wrapper className={className}>
        <Mirror ref={mirrorRef}>{value || " "}</Mirror>
        <TextField.Root
          ref={setRef}
          value={value}
          style={{
            width: `${inputWidth}px`,
            minWidth: "1ch",
            transition: "width 0.2s ease",
          }}
          {...props}
        >
          {children}
        </TextField.Root>
      </Wrapper>
    );
  }
);

AutoGrowingRadixInput.displayName = "AutoGrowingRadixInput";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Mirror = styled.span`
  position: absolute;
  visibility: hidden;
  white-space: pre;
  font: inherit;
  padding: 0;
  margin: 0;
`;
