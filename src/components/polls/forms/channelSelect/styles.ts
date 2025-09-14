import { Flex, Select } from "@radix-ui/themes";
import styled from "styled-components";

export const ChannelSelectContainer = styled.div``;

export const LoadingSelectRoot = styled(Select.Root)``;

export const ErrorContainer = styled(Flex).attrs({
  direction: "column",
  gap: "1",
})``;

export const ChannelItemContainer = styled(Flex).attrs({
  align: "center",
  gap: "2",
})``;

export const ChannelName = styled.span`
  &:before {
    content: "# ";
    color: var(--gray-a11);
  }
`;
