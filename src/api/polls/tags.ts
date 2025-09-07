import type { Tag } from "@jocasta-polls-api";
import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";

export const getTags = async (): Promise<Tag[]> => {
  try {
    const response: AxiosResponse<Tag[]> = await axiosPollsInstance.get(
      "/tags"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

/**
 * Create a new tag
 */
export const createTag = async (tagData: Omit<Tag, "tag">): Promise<Tag> => {
  try {
    const response: AxiosResponse<{ message: string; tag: Tag }> =
      await axiosPollsInstance.post("/tags/create", tagData);
    return response.data.tag;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};
