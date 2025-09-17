import type { Tag } from "@jocasta-polls-api";
import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";
import { serializeBigIntFields } from "@/utils";
import { createLogger } from "@/utils/logger";

const logger = createLogger("api/tags");

export const getTags = async (): Promise<Tag[]> => {
  try {
    const response: AxiosResponse<Tag[]> = await axiosPollsInstance.get(
      "/tags"
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching tags:", error);
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
    logger.error("Error creating tag:", error);
    throw error;
  }
};
