import { Text, Link } from "@radix-ui/themes";
import styled from "styled-components";
import { type ComponentProps, type ReactElement } from "react";

const MarkdownBold = styled.strong`
  font-weight: bold;
`;

const MarkdownItalic = styled.em`
  font-style: normal;
  font-variation-settings: "slnt" -10;
`;

const MarkdownUnderline = styled.u`
  text-decoration: underline;
`;

const MarkdownCode = styled.code`
  font-family: var(--font-mono, monospace);
  background: var(--gray-a3);
  border-radius: var(--radius-1);
  padding: 0.1em 0.3em;
  font-size: 0.95em;
`;

const MarkdownChannel = styled.span`
  color: var(--blue-11);
  background-color: var(--blue-a3);
  padding: 0.1rem 0.3rem;
  border-radius: var(--radius-1);
  font-weight: var(--font-weight-medium);
`;

const MarkdownTextContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

const MarkdownTextStyled = styled(Text)`
  color: var(--gray-a12);
  letter-spacing: 0.02rem;
`;

export interface MarkdownTextProps {
  text: string;
  editable?: boolean;
  size?: ComponentProps<typeof Text>["size"];
  align?: ComponentProps<typeof Text>["align"];
  className?: string;
  style?: React.CSSProperties;
}

export function MarkdownText({
  text,
  editable = false,
  size,
  align,
  className,
  style,
}: MarkdownTextProps) {
  const lines = text.split("\n");
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const applyMarkdownFormatting = (text: string) => {
    if (editable) return text;
    let result: (string | ReactElement)[] = [text];
    // Helper to process escapes in content
    const escapeProcessor = (str: string) => str.replace(/\\(.)/g, "$1");
    const processors = [
      {
        regex: /`([^`]+)`/g,
        replacer: (match: string, content: string, index: string) => (
          <MarkdownCode key={`code-${index}`}>
            {escapeProcessor(content)}
          </MarkdownCode>
        ),
      },
      {
        regex: /\*\*([^*]+)\*\*/g,
        replacer: (match: string, content: string, index: string) => (
          <MarkdownBold key={`bold-${index}`}>
            {escapeProcessor(content)}
          </MarkdownBold>
        ),
      },
      {
        regex: /__([^_]+)__/g,
        replacer: (match: string, content: string, index: string) => (
          <MarkdownUnderline key={`underline-${index}`}>
            {escapeProcessor(content)}
          </MarkdownUnderline>
        ),
      },
      {
        regex: /\*(((?:[^*\\]|\\.)+))\*/g,
        replacer: (match: string, content: string, index: string) => (
          <MarkdownItalic key={`italic-ast-${index}`}>
            {escapeProcessor(content)}
          </MarkdownItalic>
        ),
      },
      {
        regex: /_(((?:[^_\\]|\\.)+))_/g,
        replacer: (match: string, content: string, index: string) => (
          <MarkdownItalic key={`italic-und-${index}`}>
            {escapeProcessor(content)}
          </MarkdownItalic>
        ),
      },
      {
        regex: /<#(\d+)>/g,
        replacer: (match: string, channelId: string, index: string) => (
          <MarkdownChannel key={`channel-${index}`}>
            #{channelId}
          </MarkdownChannel>
        ),
      },
      { regex: /\\(.)/g, replacer: (match: string, char: string) => char },
    ];
    processors.forEach((processor, processorIndex) => {
      result = result.flatMap((item, itemIndex) => {
        if (typeof item !== "string") return [item];
        const parts: (string | ReactElement)[] = [];
        let lastIndex = 0;
        let match;
        processor.regex.lastIndex = 0;
        while ((match = processor.regex.exec(item)) !== null) {
          if (match.index > lastIndex)
            parts.push(item.slice(lastIndex, match.index));
          parts.push(
            processor.replacer(
              match[0],
              match[1],
              `${processorIndex}-${itemIndex}-${match.index}`
            )
          );
          lastIndex = match.index + match[0].length;
          if (match.index === processor.regex.lastIndex)
            processor.regex.lastIndex++;
        }
        if (lastIndex < item.length) parts.push(item.slice(lastIndex));
        return parts.length > 0 ? parts : [item];
      });
    });
    return result;
  };

  return (
    <MarkdownTextContainer className={className} style={style}>
      {lines.map((line, index) => {
        const parts = line.split(urlRegex);
        return (
          <MarkdownTextStyled key={index} size={size} align={align}>
            {parts.map((part, partIndex) => {
              if (urlRegex.test(part)) {
                return (
                  <Link
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    key={partIndex}
                  >
                    {part}
                  </Link>
                );
              }
              return (
                <span key={partIndex}>{applyMarkdownFormatting(part)}</span>
              );
            })}
          </MarkdownTextStyled>
        );
      })}
    </MarkdownTextContainer>
  );
}
