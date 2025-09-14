import type { PollInfo } from "@jocasta-polls-api";
import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";

export const getGuilds = async (): Promise<PollInfo[]> => {
	try {
		const response: AxiosResponse<PollInfo[]> =
			await axiosPollsInstance.get("/guilds");
		return response.data;
	} catch (error) {
		console.error("Error fetching guilds:", error);
		throw error;
	}
};

export const getGuild = async (guildId: string): Promise<PollInfo> => {
	try {
		const response: AxiosResponse<PollInfo> = await axiosPollsInstance.get(
			`/guilds/${guildId}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching guild:", error);
		throw error;
	}
};
