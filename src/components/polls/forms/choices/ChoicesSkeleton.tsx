import React from "react";
import { Flex, Skeleton, Text } from "@radix-ui/themes";
import { useIsMobile } from "@/utils/isMobile";
import { Spacer } from "@/utils/styled";
import { ChoiceLabelMap } from "./constants";
import {
  Container,
  ChoiceContainerStyle,
  ChoiceLabel,
  PercentLabel,
  BarContainer,
} from "./styles";
import { ShowVotesButtonSkeleton } from "./ShowVotesButton";

export function ChoicesSkeleton() {
  const isMobile = useIsMobile();

  return (
    <Container>
      <ChoiceContainerStyle>
        {Array.from({ length: 4 }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
          <Flex key={index} gap="2" align="center">
            <Skeleton>
              <ChoiceLabel size="4">{ChoiceLabelMap[index + 1]}</ChoiceLabel>
            </Skeleton>

            <Flex gap="1" direction="column" width="100%">
              <Flex width="100%" align="end">
                <Skeleton>
                  <Text size="2" style={{ opacity: 0 }}>
                    {isMobile ? "Loading choice..." : "Loading choice text..."}
                  </Text>
                </Skeleton>
                <Spacer />
                <Skeleton>
                  <PercentLabel size="1" title="">
                    50%
                  </PercentLabel>
                </Skeleton>
              </Flex>

              <Skeleton>
                <BarContainer />
              </Skeleton>
            </Flex>
          </Flex>
        ))}
      </ChoiceContainerStyle>
      <ShowVotesButtonSkeleton />
    </Container>
  );
}
