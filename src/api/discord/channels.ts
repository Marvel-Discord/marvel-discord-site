import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";

export interface Channel {
  id: string;
  name: string;
  type: number;
  position: number;
}

export const getGuildChannels = async (guildId: string): Promise<Channel[]> => {
  try {
    const response: AxiosResponse<Channel[]> = await axiosPollsInstance.get(
      `/discord/guilds/${guildId}/channels`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching guild channels:", error);
    throw error;
  }
};
