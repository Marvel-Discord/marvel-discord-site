import { Select, Text } from "@radix-ui/themes";
import { useMemo } from "react";

interface EndMessageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  existingEndMessages: Record<string, number>;
}

export function EndMessageSelect({
  value,
  onValueChange,
  placeholder = "Select an existing end message...",
  disabled = false,
  existingEndMessages,
}: EndMessageSelectProps) {
  // Sort end messages by frequency (most to least used)
  const sortedEndMessages = useMemo(() => {
    return Object.entries(existingEndMessages)
      .filter(([message]) => message.trim() !== "") // Filter out empty messages
      .sort(([, countA], [, countB]) => countB - countA) // Sort by frequency
      .map(([message, count]) => ({ message, count }));
  }, [existingEndMessages]);

  if (sortedEndMessages.length === 0) {
    return (
      <Text
        size="1"
        color="gray"
        style={{ fontStyle: "italic", padding: "8px 0" }}
      >
        No existing end messages found. Type a custom message below.
      </Text>
    );
  }

  return (
    <Select.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      size={"1"}
    >
      <Select.Trigger placeholder={placeholder} />
      <Select.Content>
        {sortedEndMessages.map(({ message }) => {
          return (
            <Select.Item key={message} value={message} title={message}>
              <Text
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {message}
              </Text>
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}
