import { getTags } from "@/api/polls/tags";
import type { Tag } from "@jocasta-polls-api";
import { createContext, useContext, useEffect, useState } from "react";

// Extended interface for form data (includes pending tag fields)
interface TagFormData extends Partial<Tag> {
  // All fields are optional for form data
}

interface TagContextType {
  tags: Record<number, Tag>;
  tagsOrder: number[];
  pendingTags: TagFormData[];
  addPendingTag: (tag: TagFormData) => void;
  updatePendingTag: (tagId: number, updatedTag: TagFormData) => void;
  clearPendingTags: () => void;
}

export const TagContext = createContext<TagContextType>({
  tags: {},
  tagsOrder: [],
  pendingTags: [],
  addPendingTag: () => {},
  updatePendingTag: () => {},
  clearPendingTags: () => {},
});

interface TagProviderProps {
  children: React.ReactNode;
}

export const TagProvider = ({ children }: TagProviderProps) => {
  const [tags, setTags] = useState<Record<number, Tag>>({});
  const [tagsOrder, setTagsOrder] = useState<number[]>([]);
  const [pendingTags, setPendingTags] = useState<TagFormData[]>([]);

  const addPendingTag = (tag: TagFormData) => {
    setPendingTags((prev) => [...prev, tag]);
  };

  const updatePendingTag = (tagId: number, updatedTag: TagFormData) => {
    setPendingTags((prev) =>
      prev.map((tag) => (tag.tag === tagId ? updatedTag : tag))
    );
  };

  const clearPendingTags = () => {
    setPendingTags([]);
  };

  const fetchTags = async () => {
    try {
      const response = await getTags();
      const tags: Record<number, Tag> = Object.fromEntries(
        response.map((tag) => [tag.tag, tag])
      );
      const tagsOrder: number[] = response.map((tag) => tag.tag);
      setTags(tags);
      setTagsOrder(tagsOrder);
    } catch (err) {
      console.error(err);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: On load
  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <TagContext.Provider
      value={{
        tags,
        tagsOrder,
        pendingTags,
        addPendingTag,
        updatePendingTag,
        clearPendingTags,
      }}
    >
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => useContext(TagContext);
