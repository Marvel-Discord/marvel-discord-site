import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";
import { createLogger } from "@/utils/logger";

const logger = createLogger("api/discord/channels");

export interface Channel {
  id: string;
  name: string;
  type: number;
  position: number;
}

export interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
}

export const getGuildChannels = async (guildId: string): Promise<Channel[]> => {
  try {
    const response: AxiosResponse<Channel[]> = await axiosPollsInstance.get(
      `/discord/guilds/${guildId}/channels`
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching guild channels:", error);
    throw error;
  }
};

export const getGuildRoles = async (guildId: string): Promise<Role[]> => {
  try {
    const response: AxiosResponse<Role[]> = await axiosPollsInstance.get(
      `/discord/guilds/${guildId}/roles`
    );
    return response.data;
  } catch (error) {
    logger.error("Error fetching guild roles:", error);
    throw error;
  }
};
