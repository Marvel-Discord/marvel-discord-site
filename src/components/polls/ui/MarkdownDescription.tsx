import { MarkdownText } from "@/components/common/MarkdownText";

interface MarkdownDescriptionProps {
  text: string;
  editable?: boolean;
  size?: import("@radix-ui/themes").TextProps["size"];
  align?: import("@radix-ui/themes").TextProps["align"];
  className?: string;
  style?: React.CSSProperties;
}

export function MarkdownDescription(props: MarkdownDescriptionProps) {
  return <MarkdownText {...props} />;
}
