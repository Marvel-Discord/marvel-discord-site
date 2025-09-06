import { ChangeEvent } from "react";
import { Button, Popover } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";
import { Pipette } from "lucide-react";
import { isLightColor } from "@/utils";
import {
  ColorPickerWrapper,
  ColorPickerButton,
  ColorTextField,
} from "./styles";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  placeholder?: string;
}

export function ColorPicker({
  value,
  onChange,
  placeholder = "Hex color code",
}: ColorPickerProps) {
  const displayColor = value || "#7298da";

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <ColorPickerWrapper>
      <Popover.Root>
        <Popover.Trigger>
          <ColorPickerButton
            variant="solid"
            style={{
              backgroundColor: displayColor,
            }}
          >
            <Pipette
              size={16}
              color={isLightColor(displayColor) ? "#000000" : "#ffffff"}
            />
          </ColorPickerButton>
        </Popover.Trigger>
        <Popover.Content>
          <HexColorPicker color={displayColor} onChange={onChange} />
        </Popover.Content>
      </Popover.Root>
      <ColorTextField
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
      />
      <Button
        variant="outline"
        color="gray"
        onClick={handleClear}
        disabled={!value}
      >
        Clear
      </Button>
    </ColorPickerWrapper>
  );
}
