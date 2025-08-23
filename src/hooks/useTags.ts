import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/api/polls/tags";
import { queryKeys } from "@/lib/queryKeys";
import type { Tag } from "@jocasta-polls-api";
import { useMemo } from "react";

export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: getTags,
    staleTime: 1000 * 60 * 15, // 15 minutes - tags don't change often
  });
}

// Hook to get tags in a more convenient format (Record and order array)
export function useTagsFormatted() {
  const { data: tags, isLoading, error, isPending, isError } = useTags();

  const formattedData = useMemo(() => {
    if (!tags) {
      return {
        tags: {} as Record<number, Tag>,
        tagsOrder: [] as number[],
      };
    }

    const tagRecord: Record<number, Tag> = Object.fromEntries(
      tags.map((tag) => [tag.tag, tag])
    );
    const tagsOrder: number[] = tags.map((tag) => tag.tag);

    return {
      tags: tagRecord,
      tagsOrder,
    };
  }, [tags]);

  return {
    ...formattedData,
    isLoading,
    error,
    isPending,
    isError,
    data: tags,
  };
}
