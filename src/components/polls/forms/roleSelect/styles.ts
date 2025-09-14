import { Flex, Badge, Select } from "@radix-ui/themes";
import styled from "styled-components";

export const RoleSelectContainer = styled(Flex).attrs({
  direction: "column",
  gap: "2",
})``;

export const LoadingSelectRoot = styled(Select.Root)``;

export const ErrorContainer = styled(Flex).attrs({
  direction: "column",
  gap: "1",
})``;

export const RoleColorIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  flex-shrink: 0;
`;

export const RoleItemContainer = styled(Flex).attrs({
  align: "center",
  gap: "2",
})``;

export const SelectedRolesContainer = styled(Flex).attrs({
  gap: "1",
  wrap: "wrap",
})``;

export const RoleBadge = styled(Badge).attrs({
  size: "1",
})<{ $backgroundColor: string; $textColor: string }>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  color: ${({ $textColor }) => $textColor};
`;

export const RemoveRoleButton = styled.button`
  margin-left: 4px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 10px;

  &:hover {
    opacity: 0.8;
  }
`;
