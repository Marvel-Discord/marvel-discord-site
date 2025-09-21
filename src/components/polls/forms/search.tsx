import type { DiscordUserProfile, Meta } from "@jocasta-polls-api";
import { Button, Flex, TextField, Tooltip, Select } from "@radix-ui/themes";
import {
  CircleDot,
  CircleCheck,
  CircleCheckBig,
  Search,
  X,
  Hash,
  CircleDashed,
  CircleEllipsis,
  ArrowUpDown,
  Archive,
  Dices,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import styled from "styled-components";
import { TagSelect } from "./tagSelect";
import { useIsMobile } from "@/utils/isMobile";
import { PollSearchType } from "@/utils";
import { FilterState, SortOrder } from "@/types/states";
import { ReactNode } from "react";

const SearchWrapper = styled(Flex)`
  align-items: end;
  flex-direction: column;
  width: 100%;
`;

const SearchContainer = styled(Flex)`
  align-items: center;
  height: 3rem;
  width: 100%;
`;

const SearchBar = styled(TextField.Root)`
  border-radius: var(--radius-3);
  flex: 1;
  height: 100%;
`;

const ClearButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 0;
`;

const SelectTrigger = styled(Select.Trigger)`
  border-radius: var(--radius-3);
  box-shadow: inset 0 0 0 1px var(--gray-a7);
  color: var(--gray-a11);
  cursor: pointer;
  height: 100%;
  width: 3rem;

  &:hover {
    box-shadow: inset 0 0 0 1px var(--gray-a8);
  }

  /* Hide the default chevron icon */
  & > :last-child {
    display: none;
  }

  /* Ensure the icon is properly centered */
  & > :first-child {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    line-height: 1;
    width: 100%;
  }

  /* Force the SVG icon to be centered */
  svg {
    display: block;
    margin: auto;
  }
`;

const SortDropdownWrapper = styled(Flex)`
  align-items: center;
  justify-content: flex-end;
`;

const OrderSelectTrigger = styled(Select.Trigger)`
  color: var(--gray-a11);
  margin-inline: 0rem;
`;

const SearchIconButton = styled(Button)`
  @media (hover: hover) {
    background-color: transparent;
  }
`;

interface HasVotedInfoType {
  icon: ReactNode;
  tooltip: string;
}

const HasVotedInfo: Record<FilterState, HasVotedInfoType> = {
  [FilterState.ALL]: {
    icon: <CircleCheck />,
    tooltip: "All polls",
  },
  [FilterState.NOT_VOTED]: {
    icon: <CircleDot />,
    tooltip: "Unvoted polls",
  },
  [FilterState.HAS_VOTED]: {
    icon: <CircleCheckBig />,
    tooltip: "Voted polls",
  },
  [FilterState.UNPUBLISHED]: {
    icon: <CircleDashed />,
    tooltip: "Unpublished polls",
  },
  [FilterState.PUBLISHED]: {
    icon: <CircleEllipsis />,
    tooltip: "Published polls",
  },
};

interface SortInfoType {
  icon: ReactNode;
  iconSmall: ReactNode;
  label: string;
  tooltip: string;
}

const SortInfo: Record<SortOrder, SortInfoType> = {
  [SortOrder.NEWEST]: {
    icon: <Sparkles size={20} />,
    iconSmall: <Sparkles size={16} />,
    label: "Newest",
    tooltip: "Order by newest first",
  },
  [SortOrder.OLDEST]: {
    icon: <Archive size={20} />,
    iconSmall: <Archive size={16} />,
    label: "Oldest",
    tooltip: "Order by oldest first",
  },
  [SortOrder.MOST_VOTES]: {
    icon: <TrendingUp size={20} />,
    iconSmall: <TrendingUp size={16} />,
    label: "Most votes",
    tooltip: "Order by most votes first",
  },
  [SortOrder.LEAST_VOTES]: {
    icon: <TrendingDown size={20} />,
    iconSmall: <TrendingDown size={16} />,
    label: "Least votes",
    tooltip: "Order by least votes first",
  },
  [SortOrder.SHUFFLE]: {
    icon: <Dices size={20} />,
    iconSmall: <Dices size={16} />,
    label: "Shuffle",
    tooltip: "Shuffle order",
  },
};

function FilterToggle({
  filterState,
  setFilterState,
  isManager = false,
}: {
  filterState?: FilterState;
  setFilterState?: (state: FilterState) => void;
  isManager?: boolean;
}) {
  if (!filterState || !setFilterState) {
    return null;
  }

  const { icon, tooltip } = HasVotedInfo[filterState];

  const getAvailableOptions = () => {
    const baseOptions = [
      { value: FilterState.ALL, label: "All polls", icon: <CircleCheck /> },
      {
        value: FilterState.NOT_VOTED,
        label: "Unvoted polls",
        icon: <CircleDot />,
      },
      {
        value: FilterState.HAS_VOTED,
        label: "Voted polls",
        icon: <CircleCheckBig />,
      },
    ];

    if (isManager) {
      baseOptions.push(
        {
          value: FilterState.UNPUBLISHED,
          label: "Unpublished polls",
          icon: <CircleDashed />,
        },
        {
          value: FilterState.PUBLISHED,
          label: "Published polls",
          icon: <CircleEllipsis />,
        }
      );
    }

    return baseOptions;
  };

  return (
    <Select.Root value={filterState} onValueChange={setFilterState}>
      <Tooltip content={tooltip}>
        <SelectTrigger>{icon}</SelectTrigger>
      </Tooltip>
      <Select.Content position="popper">
        {getAvailableOptions().map((option) => (
          <Select.Item key={option.value} value={option.value}>
            <Flex align="center" gap="2">
              {option.icon}
              {option.label}
            </Flex>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

function SortDropdown({
  sortOrder = SortOrder.NEWEST,
  setSortOrder = () => {},
  onReshuffle,
}: {
  sortOrder?: SortOrder;
  setSortOrder?: (order: SortOrder) => void;
  onReshuffle?: () => void;
}) {
  const { label, tooltip } = SortInfo[sortOrder];

  return (
    <SortDropdownWrapper>
      {sortOrder === SortOrder.SHUFFLE && (
        <Tooltip content="Reshuffle polls">
          <Button variant="ghost" onClick={onReshuffle}>
            {SortInfo[SortOrder.SHUFFLE].iconSmall}
          </Button>
        </Tooltip>
      )}
      <Select.Root value={sortOrder} onValueChange={setSortOrder} size="1">
        <Tooltip content={tooltip}>
          <OrderSelectTrigger variant="ghost" color="gray">
            <Flex align="center" gap="1" direction={"row"}>
              {label}
              <ArrowUpDown size={16} />
            </Flex>
          </OrderSelectTrigger>
        </Tooltip>
        <Select.Content position="popper">
          {Object.entries(SortInfo).map(([value, info]) => (
            <Select.Item key={value} value={value}>
              <Flex align="center" gap="2">
                {info.icon}
                {info.label}
              </Flex>
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </SortDropdownWrapper>
  );
}

export function PollsSearch({
  handleSearch,
  handleTagSelect,
  searchValue = "",
  selectedTag = null,
  meta = null,
  disabled = false,
  filterState,
  setFilterState,
  searchType = PollSearchType.SEARCH,
  user = undefined,
  sortOrder = SortOrder.NEWEST,
  setSortOrder,
  onReshuffle,
}: {
  handleSearch: (value: string, searchType?: PollSearchType) => void;
  handleTagSelect: (tag: string) => void;
  searchValue?: string;
  selectedTag?: number | null;
  meta?: Meta | null;
  disabled?: boolean;
  filterState?: FilterState;
  setFilterState?: (state: FilterState) => void;
  searchType?: PollSearchType;
  user?: DiscordUserProfile | null;
  sortOrder?: SortOrder;
  setSortOrder?: (order: SortOrder) => void;
  onReshuffle?: () => void;
}) {
  const isMobile = useIsMobile();

  const isIdSearch = searchType === "id";

  const handleSearchTypeCycle = () => {
    if (isIdSearch) {
      handleSearch(searchValue, PollSearchType.SEARCH);
    } else {
      handleSearch(searchValue, PollSearchType.ID);
    }
  };

  return (
    <SearchWrapper gap="1">
      <SearchContainer gap="2" align="center">
        <SearchBar
          type={isIdSearch ? "number" : "text"}
          placeholder={!isIdSearch ? "Search polls" : "Search by ID"}
          size="3"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={disabled}
        >
          <TextField.Slot>
            <SearchIconButton
              variant="ghost"
              color="gray"
              onClick={handleSearchTypeCycle}
            >
              {!isIdSearch ? <Search size={20} /> : <Hash size={20} />}
            </SearchIconButton>
          </TextField.Slot>
          {(searchValue || isIdSearch) && !disabled && (
            <TextField.Slot>
              <ClearButton
                type="button"
                onClick={() => {
                  handleSearch("", PollSearchType.SEARCH);
                }}
              >
                <X size={20} />
              </ClearButton>
            </TextField.Slot>
          )}
          {meta && (
            <TextField.Slot>
              {meta.total}
              {isMobile ? "" : " results"}
            </TextField.Slot>
          )}
        </SearchBar>

        {user && (
          <FilterToggle
            filterState={filterState}
            setFilterState={setFilterState}
            isManager={user.isManager}
          />
        )}

        <TagSelect
          selectedTag={selectedTag}
          handleTagSelect={handleTagSelect}
          disabled={disabled}
        />
      </SearchContainer>
      <SortDropdown
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onReshuffle={onReshuffle}
      />
    </SearchWrapper>
  );
}
