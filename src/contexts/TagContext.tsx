import { getTags, createTag } from "@/api/polls/tags";
import type { Tag } from "@jocasta-polls-api";
import { createContext, useContext, useEffect, useState } from "react";

interface TagContextType {
  tags: Record<number, Tag>;
  tagsOrder: number[];
  pendingTags: Partial<Tag>[];
  addPendingTag: (tag: Partial<Tag>) => void;
  updatePendingTag: (tagId: number, updatedTag: Partial<Tag>) => void;
  clearPendingTags: () => void;
  createNewTag: (
    tagData: Omit<Tag, "tag">
  ) => Promise<{ success: boolean; tag?: Tag; message?: string }>;
  isSaving: boolean;
}

export const TagContext = createContext<TagContextType>({
  tags: {},
  tagsOrder: [],
  pendingTags: [],
  addPendingTag: () => {},
  updatePendingTag: () => {},
  clearPendingTags: () => {},
  createNewTag: async () => ({ success: false }),
  isSaving: false,
});

interface TagProviderProps {
  children: React.ReactNode;
}

export const TagProvider = ({ children }: TagProviderProps) => {
  const [tags, setTags] = useState<Record<number, Tag>>({});
  const [tagsOrder, setTagsOrder] = useState<number[]>([]);
  const [pendingTags, setPendingTags] = useState<Partial<Tag>[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addPendingTag = (tag: Partial<Tag>) => {
    setPendingTags((prev) => [...prev, tag]);
  };

  const updatePendingTag = (tagId: number, updatedTag: Partial<Tag>) => {
    setPendingTags((prev) =>
      prev.map((tag) => (tag.tag === tagId ? updatedTag : tag))
    );
  };

  const clearPendingTags = () => {
    setPendingTags([]);
  };

  const createNewTag = async (
    tagData: Omit<Tag, "tag">
  ): Promise<{ success: boolean; tag?: Tag; message?: string }> => {
    setIsSaving(true);

    try {
      const newTag = await createTag(tagData);

      // Add the new tag to local state
      setTags((prev) => ({
        ...prev,
        [newTag.tag]: newTag,
      }));
      setTagsOrder((prev) => [...prev, newTag.tag]);

      return {
        success: true,
        tag: newTag,
        message: "Tag created successfully!",
      };
    } catch (error) {
      console.error("Failed to create tag:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create tag",
      };
    } finally {
      setIsSaving(false);
    }
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
        createNewTag,
        isSaving,
      }}
    >
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => useContext(TagContext);
