import { SortOrder } from "@/types/states";

export interface SortParams {
  order?: string;
  orderDir?: "asc" | "desc";
}

export function mapSortOrderToApiParams(sortOrder: SortOrder): SortParams {
  switch (sortOrder) {
    case SortOrder.NEWEST:
      return { order: "time", orderDir: "desc" };
    case SortOrder.OLDEST:
      return { order: "time", orderDir: "asc" };
    case SortOrder.MOST_VOTES:
      return { order: "votes", orderDir: "desc" };
    case SortOrder.LEAST_VOTES:
      return { order: "votes", orderDir: "asc" };
    case SortOrder.SHUFFLE:
      return { order: "random" };
    default:
      return { order: "time", orderDir: "desc" };
  }
}
