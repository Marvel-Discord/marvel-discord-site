import React from "react";
import { Flex } from "@radix-ui/themes";
import { PollsSearch } from "../forms/search";
import styled from "styled-components";

const BodyContainer = styled(Flex).attrs({
  direction: "column",
  gap: "4",
  align: "center",
  justify: "center",
})``;

const FullWidthScroll = styled.div`
  width: 100%;
`;

const PollCardContainer = styled(Flex).attrs({
  direction: "column",
  gap: "4",
  align: "center",
  justify: "center",
})`
  width: 100%;
`;

interface PollsLoadingSkeletonProps {
  skeletons?: React.ReactNode[];
}

export function PollsLoadingSkeleton({ skeletons }: PollsLoadingSkeletonProps) {
  return (
    <BodyContainer>
      <PollsSearch
        handleSearch={() => {}}
        handleTagSelect={() => {}}
        disabled
      />
      <FullWidthScroll>
        <PollCardContainer>{skeletons}</PollCardContainer>
      </FullWidthScroll>
    </BodyContainer>
  );
}
