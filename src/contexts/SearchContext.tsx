import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { PollSearchType } from "@/utils";

interface PollsSearchContextType {
  searchValue: string;
  searchType: PollSearchType;
  setSearchToUser: (username: string) => void;
  // Add these for internal communication
  _setSearchValue: (value: string) => void;
  _setSearchType: (type: PollSearchType) => void;
  _triggerSearch: boolean;
  _setTriggerSearch: (trigger: boolean) => void;
}

const PollsSearchContext = createContext<PollsSearchContextType>({
  searchValue: "",
  searchType: PollSearchType.SEARCH,
  setSearchToUser: () => {},
  _setSearchValue: () => {},
  _setSearchType: () => {},
  _triggerSearch: false,
  _setTriggerSearch: () => {},
});

export function PollsSearchProvider({ children }: { children: ReactNode }) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchType, setSearchType] = useState<PollSearchType>(
    PollSearchType.SEARCH
  );
  const [triggerSearch, setTriggerSearch] = useState<boolean>(false);

  const setSearchToUser = useCallback((username: string) => {
    setSearchValue(username);
    setSearchType(PollSearchType.SEARCH);
    setTriggerSearch(true);
  }, []);

  return (
    <PollsSearchContext.Provider
      value={{
        searchValue,
        searchType,
        setSearchToUser,
        _setSearchValue: setSearchValue,
        _setSearchType: setSearchType,
        _triggerSearch: triggerSearch,
        _setTriggerSearch: setTriggerSearch,
      }}
    >
      {children}
    </PollsSearchContext.Provider>
  );
}

export const usePollsSearchContext = () => {
  const context = useContext(PollsSearchContext);
  return context;
};
