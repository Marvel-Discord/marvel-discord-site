export enum FilterState {
  HAS_VOTED = "Has Voted",
  NOT_VOTED = "Not Voted",
  PUBLISHED = "Published",
  UNPUBLISHED = "Unpublished",
  ALL = "All",
}

export enum EditState {
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  CREATE = "CREATE",
  NONE = "NONE",
}

export enum SortOrder {
  NEWEST = "newest",
  OLDEST = "oldest",
  MOST_VOTES = "most_votes",
  LEAST_VOTES = "least_votes",
  SHUFFLE = "shuffle",
}
