import React from "react";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";

interface ChoiceAlertProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  button: React.ReactNode;
}

export function ChoiceAlert({
  trigger,
  title,
  description,
  button,
}: ChoiceAlertProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>{description}</AlertDialog.Description>
        <Flex gap="5" justify="end" mt="4">
          <AlertDialog.Action>{button}</AlertDialog.Action>
          <AlertDialog.Cancel>
            <Button variant="ghost" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
