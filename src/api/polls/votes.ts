import type { Vote } from "@jocasta-polls-api";
import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";
import { createLogger } from "@/utils/logger";

const logger = createLogger("api/votes");

export const getUserVotes = async (userId: string): Promise<Vote[]> => {
  try {
    const response: AxiosResponse<Vote[]> = await axiosPollsInstance.get(
      `/polls/votes/${userId}`
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching user votes:", error);
    throw error;
  }
};

export const postVote = async (
  pollId: number,
  userId: string,
  choiceId?: number
) => {
  try {
    const response: AxiosResponse<Vote> = await axiosPollsInstance.post(
      `/polls/${pollId}/vote`,
      { choice: choiceId ?? null, userId }
    );
    return response.data;
  } catch (error) {
    logger.error("Error submitting vote:", error);
    throw error;
  }
};
