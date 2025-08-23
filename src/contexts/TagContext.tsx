import { useTagsFormatted } from "@/hooks/useTags";
import type { Tag } from "@jocasta-polls-api";
import { createContext, useContext, useMemo } from "react";

interface TagContextType {
  tags: Record<number, Tag>;
  tagsOrder: number[];
  isLoading: boolean;
  error: Error | null;
}

export const TagContext = createContext<TagContextType>({
  tags: {},
  tagsOrder: [],
  isLoading: false,
  error: null,
});

interface TagProviderProps {
  children: React.ReactNode;
}

export const TagProvider = ({ children }: TagProviderProps) => {
  const { tags, tagsOrder, isLoading, error } = useTagsFormatted();

  const value = useMemo(
    () => ({ tags, tagsOrder, isLoading, error }),
    [tags, tagsOrder, isLoading, error]
  );

  return (
    <TagContext.Provider value={value}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => useContext(TagContext);
