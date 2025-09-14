import { Text } from "@radix-ui/themes";
import type { ComponentProps } from "react";

type TitleTextProps = {
  title?: string;
  children: React.ReactNode;
} & ComponentProps<typeof Text>;

export function TitleText({ title, children, ...props }: TitleTextProps) {
  return (
    <Text {...props}>
      <span title={title}>{children}</span>
    </Text>
  );
}
