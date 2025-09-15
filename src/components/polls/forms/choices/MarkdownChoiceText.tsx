import { MarkdownText } from "@/components/common/MarkdownText";
import { ChoiceCheck } from "./styles";
import { Flex } from "@radix-ui/themes";
import React from "react";

interface MarkdownChoiceTextProps {
  text: string;
  size?: string | number;
  userVote?: number;
  index: number;
}

export function MarkdownChoiceText({
  text,
  size,
  userVote,
  index,
}: MarkdownChoiceTextProps) {
  // Ensure size is a valid Radix size string ("1" to "9")
  const radixSize = typeof size === "number" ? String(size) : size;
  return (
    <Flex align="center" gap="1">
      <MarkdownText text={text} size={radixSize as any} editable={false} />
      {userVote !== undefined && userVote === index && (
        <ChoiceCheck size="20" $isChecked />
      )}
    </Flex>
  );
}
