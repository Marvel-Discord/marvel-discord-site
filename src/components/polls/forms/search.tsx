import type { DiscordUserProfile, Meta } from "@jocasta-polls-api";
import { Button, Flex, IconButton, TextField, Tooltip } from "@radix-ui/themes";
import {
  CircleDot,
  CircleCheck,
  CircleCheckBig,
  Search,
  X,
  Hash,
  CircleDashed,
  CircleEllipsis,
} from "lucide-react";
import styled from "styled-components";
import { TagSelect } from "./tagSelect";
import { useIsMobile } from "@/utils/isMobile";
import { PollSearchType } from "@/utils";
import { FilterState } from "@/types/states";

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

const HasVotedButton = styled(IconButton)`
  background-color: var(--color-surface);
  border-radius: var(--radius-3);
  color: var(--gray-a11);
  height: 100%;
  width: 3rem;
`;

const SearchIconButton = styled(Button)`
  @media (hover: hover) {
    background-color: transparent;
  }
`;

interface HasVotedInfoType {
  icon: React.ReactNode;
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

  function cycle() {
    if (!setFilterState) {
      return;
    }

    switch (filterState) {
      case FilterState.ALL:
        setFilterState(FilterState.NOT_VOTED);
        break;

      case FilterState.NOT_VOTED:
        setFilterState(FilterState.HAS_VOTED);
        break;

      case FilterState.HAS_VOTED:
        setFilterState(isManager ? FilterState.UNPUBLISHED : FilterState.ALL);
        break;

      case FilterState.UNPUBLISHED:
        setFilterState(FilterState.ALL);
        break;

      case FilterState.PUBLISHED:
        setFilterState(FilterState.ALL);
        break;

      default:
        setFilterState(FilterState.ALL);
    }
  }

  const { icon, tooltip } = HasVotedInfo[filterState];

  return (
    <Tooltip content={tooltip}>
      <HasVotedButton variant="surface" color="gray" onClick={cycle}>
        {icon}
      </HasVotedButton>
    </Tooltip>
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
  );
}
