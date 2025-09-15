import { useTagContext } from "@/contexts/TagContext";
import { getTagColors } from "@/utils";
import { useIsMobile } from "@/utils/isMobile";
import { Box, Select } from "@radix-ui/themes";
import { Tag as LucideTag } from "lucide-react";
import styled from "styled-components";

const TagSelectContainer = styled(Box)`
  height: 100%;
`;

const TagSelectRoot = styled(Select.Root)``;

const TagSelectTrigger = styled(Select.Trigger)<{
  $backgroundColor?: string;
  $textColor?: string;
}>`
  align-items: center;
  border-radius: var(--radius-3);
  display: flex;
  height: 100%;

  ${({ $backgroundColor }) =>
    $backgroundColor && `background-color: ${$backgroundColor};`}
  ${({ $textColor }) => $textColor && `color: ${$textColor};`}

  span {
    align-items: center;
    display: flex;

    ${({ $textColor }) => !$textColor && "color: var(--gray-a11);"}
  }
`;

const TagSelectItem = styled(Select.Item)<{
  $backgroundColor?: string;
  $textColor?: string;
}>`
  &[data-highlighted] {
    ${({ $backgroundColor }) => `background-color: ${$backgroundColor}`};
    ${({ $textColor }) => $textColor && `color: ${$textColor};`}
  }
`;

export function TagSelect({
  selectedTag,
  handleTagSelect,
  disabled = false,
}: {
  selectedTag: number | null;
  handleTagSelect: (tag: string) => void;
  disabled?: boolean;
}) {
  const isMobile = useIsMobile();
  const { tags, tagsOrder } = useTagContext();

  const {
    backgroundColor: selectedTagBackgroundColor,
    textColor: selectedTagTextColor,
  } = getTagColors(selectedTag ? tags[selectedTag] : undefined);

  // Determine the value for the select
  const selectValue =
    selectedTag && tags && tags[selectedTag] ? selectedTag.toString() : "all";

  return (
    <TagSelectContainer>
      <TagSelectRoot
        value={selectValue}
        onValueChange={handleTagSelect}
        disabled={disabled}
      >
        <TagSelectTrigger
          aria-label="Filter by tag"
          $backgroundColor={selectedTagBackgroundColor}
          $textColor={selectedTagTextColor}
        >
          {isMobile ? (
            <LucideTag size="20" />
          ) : selectedTag && tags && tags[selectedTag] ? (
            tags[selectedTag].name
          ) : (
            "All tags"
          )}
        </TagSelectTrigger>
        <Select.Content>
          <Select.Item value="all">All tags</Select.Item>
          <Select.Separator />
          {tagsOrder && tags
            ? tagsOrder.map((tag) => {
                const tagObj = tags[tag];
                if (!tagObj) return null;
                const { backgroundColor, textColor } = getTagColors(tagObj);
                return (
                  <TagSelectItem
                    key={tag}
                    value={tag.toString()}
                    $backgroundColor={backgroundColor}
                    $textColor={textColor}
                  >
                    {tagObj.name}
                  </TagSelectItem>
                );
              })
            : null}
        </Select.Content>
      </TagSelectRoot>
    </TagSelectContainer>
  );
}
