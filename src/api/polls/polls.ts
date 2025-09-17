import type { Meta, Poll } from "@jocasta-polls-api";
import { axiosPollsInstance } from "../axios";
import type { AxiosResponse } from "axios";
import config from "@/app/config/config";
import { serializePollsForAPI } from "@/utils";
import { createLogger } from "@/utils/logger";

const logger = createLogger("api/polls");

interface GetPollsParams {
  guildId?: string | bigint;
  published?: boolean;
  tag?: number;
  user?: PollFilterUser;
  search?: string;

  // Ordering parameters
  order?: string;
  orderDir?: "asc" | "desc";
  seed?: number;

  page?: number;
  limit?: number;

  signal?: AbortSignal;
}

export interface PollFilterUser {
  userId: bigint;
  notVoted?: boolean;
}

export const getPolls = async ({
  guildId = config.guildId,
  published = true,
  tag,
  user,
  search,
  order,
  orderDir,
  seed,
  page = 1,
  limit = 10,
  signal,
}: GetPollsParams): Promise<{ polls: Poll[]; meta: Meta }> => {
  try {
    const params = {
      guildId: guildId.toString(),
      published: published,
      tag: tag,
      userId: user ? user.userId.toString() : undefined,
      notVoted: user ? user?.notVoted : undefined,
      search: search,
      order: order,
      orderDir: orderDir,
      seed: seed,
      page: page,
      limit: limit,
    };

    const response: AxiosResponse<{ data: Poll[]; meta: Meta }> =
      await axiosPollsInstance.get("/polls", { params: params, signal });

    return { polls: response.data.data, meta: response.data.meta };
  } catch (error) {
    logger.error("Error fetching polls:", error);
    throw error;
  }
};

export const getPollById = async (pollId: string): Promise<Poll> => {
  try {
    const response: AxiosResponse<Poll> = await axiosPollsInstance.get(
      `/polls/${pollId ?? 0}`
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching poll:", error);
    throw error;
  }
};

/**
 * Create new polls
 */
export const createPolls = async (
  polls: Omit<Poll, "id">[]
): Promise<Poll[]> => {
  try {
    // Serialize BigInt fields and Date objects for JSON compatibility
    const serializedPolls = serializePollsForAPI(polls);
    const response: AxiosResponse<{ data: Poll[] }> =
      await axiosPollsInstance.post("/polls/create", serializedPolls);
    return response.data.data;
  } catch (error) {
    logger.error("Error creating polls:", error);
    throw error;
  }
};

/**
 * Update existing polls
 */
export const updatePolls = async (polls: Poll[]): Promise<Poll[]> => {
  try {
    // Serialize BigInt fields and Date objects for JSON compatibility
    const serializedPolls = serializePollsForAPI(polls);
    const response: AxiosResponse<{ data: Poll[] }> =
      await axiosPollsInstance.post("/polls/update", serializedPolls);
    return response.data.data;
  } catch (error) {
    logger.error("Error updating polls:", error);
    throw error;
  }
};

/**
 * Delete polls by IDs
 */
export const deletePolls = async (pollIds: string[]): Promise<void> => {
  try {
    await axiosPollsInstance.post("/polls/delete", { pollIds });
  } catch (error) {
    logger.error("Error deleting polls:", error);
    throw error;
  }
};
