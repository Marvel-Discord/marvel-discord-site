import React from "react";
import { Flex, Tooltip } from "@radix-ui/themes";
import { Plus, X } from "lucide-react";
import type { Poll, Tag } from "@jocasta-polls-api";
import { intToColorHex, trimRunningStringSingleLine } from "@/utils";
import { Spacer } from "@/utils/styled";
import { useIsMobile } from "@/utils/isMobile";
import { ChoiceLabelMap } from "./constants";
import {
  ChoiceContainerInner,
  ChoiceLabelButton,
  ChoiceLabelDiv,
  ChoiceLabel,
  ChoiceText,
  ChoiceTextEditable,
  ChoiceCheck,
  PercentLabel,
  BarContainer,
  BarLine,
} from "./styles";
import { MarkdownChoiceText } from "./MarkdownChoiceText";

interface ChoiceContainerProps {
  choice: string;
  editable?: boolean;
  enticer?: boolean;
  index: number;
  onDelete?: () => void;
  onVote?: () => void;
  percentageVotes?: number[];
  poll: Poll;
  setChoice?: (value: string) => void;
  showVotes?: boolean;
  tag?: Tag;
  userVote?: number;
}

export function ChoiceContainer({
  choice,
  editable = false,
  enticer = false,
  index,
  onDelete,
  percentageVotes = [],
  poll,
  setChoice,
  showVotes = false,
  tag,
  userVote,
}: ChoiceContainerProps) {
  const isMobile = useIsMobile();

  const relativePercentage = (percentage: number) =>
    percentage ? (percentage / Math.max(...percentageVotes)) * 100 : 0;

  const tagColor = tag?.colour ? intToColorHex(tag.colour) : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChoice?.(trimRunningStringSingleLine(e.target.value));
  };

  const canDelete =
    editable &&
    choice.length === 0 &&
    poll.choices.length > 1 &&
    !poll.published;

  return (
    <ChoiceContainerInner>
      {editable ? (
        <ChoiceLabelButton
          $isDisabled={!canDelete || enticer}
          onClick={editable ? onDelete : undefined}
        >
          <ChoiceLabel size="4" $canHover={canDelete && !enticer}>
            {!editable ? (
              ChoiceLabelMap[index + 1]
            ) : !canDelete ? (
              ChoiceLabelMap[index + 1]
            ) : !enticer ? (
              <X strokeWidth={3} />
            ) : (
              <Plus strokeWidth={3} />
            )}
          </ChoiceLabel>
        </ChoiceLabelButton>
      ) : (
        <ChoiceLabelDiv $isDisabled={!canDelete || enticer}>
          <ChoiceLabel size="4" $canHover={canDelete && !enticer}>
            {ChoiceLabelMap[index + 1]}
          </ChoiceLabel>
        </ChoiceLabelDiv>
      )}

      <Flex gap="1" direction="column" width="100%">
        <Flex gap="1" width="100%" align="end">
          {editable ? (
            <ChoiceTextEditable
              $size={isMobile ? "2" : "3"}
              onChange={handleChange}
              onBlur={() => setChoice?.(choice.trim())}
              placeholder={
                !enticer
                  ? `Choice ${ChoiceLabelMap[index + 1]}`
                  : "Add new choice"
              }
              value={choice}
            />
          ) : (
            <MarkdownChoiceText
              text={choice}
              size={isMobile ? "2" : "3"}
              userVote={userVote}
              index={index}
            />
          )}
          <Spacer />
          {(editable ? percentageVotes.length > index : showVotes) &&
            poll.votes && (
              <Tooltip
                content={`${poll.votes[index]} Vote${
                  poll.votes[index] > 1 ? "s" : ""
                }`}
              >
                <PercentLabel size="1">
                  {percentageVotes[index].toFixed(0)}%
                </PercentLabel>
              </Tooltip>
            )}
        </Flex>

        <BarContainer>
          <BarLine
            $percentage={
              editable || showVotes
                ? relativePercentage(percentageVotes[index])
                : 0
            }
            $color={tagColor}
            $isChecked={!editable && userVote === index}
            $canHover={!editable}
          />
        </BarContainer>
      </Flex>
    </ChoiceContainerInner>
  );
}
