import type { Tag } from "@jocasta-polls-api";
import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";
import { serializeBigIntFields } from "@/utils";

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
    // Serialize BigInt fields to strings for JSON compatibility
    const serializedTagData = serializeBigIntFields(tagData);

    const response: AxiosResponse<Tag> = await axiosPollsInstance.post(
      "/tags/create",
      serializedTagData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};
