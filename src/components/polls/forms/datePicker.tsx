import { useIsMobile } from "@/utils/isMobile";
import { forwardRef } from "react";
import DatePicker, { type DatePickerProps } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";

const DatePickerContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  justify-content: center;
`;

const CustomDatePicker = forwardRef<DatePicker, DatePickerProps>(
  (props, ref) => <DatePicker ref={ref} {...props} />
);

CustomDatePicker.displayName = "CustomDatePicker";

const DatePickerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  overflow: visible;

  .react-datepicker-popper {
    .react-datepicker {
      background-color: var(--color-background);
      border-radius: 0.5rem;
      font-family: inherit;
      border: 0.125rem solid var(--gray-a4);

      * {
        color: var(--gray-12);
        font-family: inherit;
      }

      .react-datepicker__header {
        background-color: var(--gray-a2);
        border-bottom: none;
      }

      .react-datepicker__day {
        &:hover:not(.react-datepicker__day--disabled) {
          background-color: var(--gray-a3);
        }

        &.react-datepicker__day--selected {
          background-color: var(--focus-8);

          &:hover {
            background-color: var(--focus-7);
          }
        }

        &.react-datepicker__day--keyboard-selected {
          background-color: var(--focus-6);

          &:hover {
            background-color: var(--focus-5);
          }
        }

        &.react-datepicker__day--disabled {
          color: var(--gray-8);
        }
      }

      .react-datepicker__input-time-container {
        align-items: center;
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-bottom: 1rem;
        margin-inline: auto;
        margin-top: 0;
        width: 100%;

        .react-datepicker-time__input {
          background-color: var(--gray-a2);
          margin: 0;
          border: none;
          border-radius: 0.5rem;
          padding-inline: 0.1rem;
          padding-block: 0.05rem;

          &:focus-visible,
          &:focus {
            outline: 2px solid var(--focus-a8);
          }
        }
      }
    }

    .react-datepicker__triangle {
      fill: var(--gray-4);
      color: var(--gray-4);
      stroke: var(--gray-4);
    }
  }
`;

const StyledDatePicker = styled(CustomDatePicker)<{ $isMobile?: boolean }>`
  background-color: var(--gray-6);
  border-radius: 0.5rem;
  border: none;
  color: inherit;
  font-family: inherit;
  height: 100%;
  padding: 0.25rem;
  width: ${({ $isMobile }) => ($isMobile ? "9rem" : "12rem")};

  &:focus-visible,
  &:focus {
    outline: 2px solid var(--focus-8);
  }
`;

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function DatePickerComponent({
  selected,
  onChange,
}: {
  selected: Date | null;
  onChange: (date: Date | null) => void;
}) {
  const isMobile = useIsMobile();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  }).formatToParts(new Date(selected ?? Date.now()));

  const timeZone = parts.find((part) => part.type === "timeZoneName")?.value;

  return (
    <DatePickerContainer>
      <DatePickerWrapper>
        <StyledDatePicker
          dateFormat={
            !isMobile ? "MMMM d, yyyy, h:mm aa" : "dd/MM/yyyy h:mm aa"
          }
          minDate={new Date()}
          minTime={
            selected && isToday(selected)
              ? new Date()
              : new Date(new Date().setHours(0, 0, 0, 0))
          }
          onChange={onChange}
          placeholderText="Select a date"
          selected={selected ?? undefined}
          showTimeInput
          $isMobile={isMobile}
        />
      </DatePickerWrapper>
      ({timeZone})
    </DatePickerContainer>
  );
}
