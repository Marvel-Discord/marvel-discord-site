import { ChangeEvent } from "react";
import { Button, Popover } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";
import { Pipette } from "lucide-react";
import { isLightColor, intToColorHex } from "@/utils";
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
  // Convert integer values to hex format for display
  const getDisplayColor = (inputValue: string): string => {
    if (!inputValue) return "#7298da";

    // If it's already a hex color (starts with #), use it as is
    if (inputValue.startsWith("#")) {
      return inputValue;
    }

    // If it's a numeric string (integer), convert to hex
    const numericValue = parseInt(inputValue, 10);
    if (!isNaN(numericValue)) {
      return intToColorHex(numericValue);
    }

    // Fallback to default color
    return "#ea2328";
  };

  const displayColor = getDisplayColor(value);

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
        value={displayColor}
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
