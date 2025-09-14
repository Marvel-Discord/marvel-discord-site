import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import styled, { css, keyframes } from "styled-components";
import { CircleCheckBig } from "lucide-react";
import { AutoGrowingTextAreaStyled } from "../autoGrowingRadixTextArea";

export const Container = styled(Flex).attrs({
  gap: "2",
  direction: "column",
  width: "100%",
  align: "end",
})``;

export const ChoiceContainerStyle = styled(Box)`
  border-color: var(--gray-a3);
  border-radius: var(--radius-3);
  border-style: solid;
  border-width: 0.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  width: 100%;
`;

export const ChoiceContainerButton = styled.button.attrs({
  type: "button",
})`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

export const ChoiceContainerInner = styled(Flex).attrs({
  gap: "2",
  align: "center",
})``;

export const BarContainer = styled.div`
  background-color: var(--gray-a5);
  border-radius: 100rem;
  height: 0.4rem;
  width: 100%;
`;

export const BarLine = styled.div<{
  $percentage: number;
  $color?: string;
  $isChecked?: boolean;
  $canHover?: boolean;
}>`
  background-color: ${({ $color }) => $color || "var(--red-9)"};
  border-radius: 100rem;
  height: 100%;
  opacity: ${({ $isChecked }) => ($isChecked ? 0.95 : 0.75)};
  transition: opacity 0.1s ease-in-out, width 0.3s ease-in-out;
  width: ${({ $percentage }) => `${$percentage}%`};

  ${ChoiceContainerButton}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }
`;

export const ChoiceLabelButton = styled.button<{ $isDisabled: boolean }>`
  align-items: center;
  background-color: transparent;
  border: none;

  ${({ $isDisabled }) =>
    $isDisabled ? "pointer-events: none;" : "cursor: pointer;"}
`;

export const ChoiceLabelDiv = styled.div<{ $isDisabled: boolean }>`
  align-items: center;
  background-color: transparent;

  ${({ $isDisabled }) =>
    $isDisabled ? "pointer-events: none;" : "cursor: pointer;"}
`;

export const ChoiceLabel = styled(Heading)<{ $canHover?: boolean }>`
  opacity: 0.4;
  transition: opacity 0.1s ease-in-out;
  width: 1rem;
  text-align: center;
  display: flex;
  align-items: center;

  ${ChoiceContainerButton}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }

  ${ChoiceLabelButton}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }

  ${ChoiceLabelDiv}:hover & {
    ${({ $canHover = true }) => ($canHover ? "opacity: 1;" : "")}
  }
`;

export const ChoiceText = styled(Text)`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  text-align: left;
`;

export const ChoiceTextEditable = styled(AutoGrowingTextAreaStyled)<{
  $size: string;
}>`
  min-height: var(--line-height-${({ $size }) => $size});

  > textarea {
    font-size: var(--font-size-${({ $size }) => $size});
    line-height: var(--line-height-${({ $size }) => $size});
  }
`;

const scaleUpDown = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05); /* Slightly bigger */
  }
  100% {
    transform: scale(1); /* Back to normal size */
  }
`;

export const ChoiceCheck = styled(CircleCheckBig)<{ $isChecked: boolean }>`
  display: ${({ $isChecked }) => ($isChecked ? "block" : "none")};

  animation: ${({ $isChecked }) =>
    $isChecked
      ? css`
          ${scaleUpDown} 0.15s ease-in-out
        `
      : "none"};
`;

export const PercentLabel = styled(Text)`
  color: var(--gray-a11);
`;

export const ShowVotesButtonStyle = styled(Button).attrs({
  variant: "ghost",
  color: "gray",
  size: "1",
})`
  width: fit-content;
  margin-inline: 0rem;
`;
