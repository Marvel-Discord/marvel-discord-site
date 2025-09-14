import type { DiscordUserProfile } from "@jocasta-polls-api";
import type { AxiosResponse } from "axios";
import { axiosPollsInstance } from "../axios";
import axios from "axios";

export const getUser = async (): Promise<DiscordUserProfile | null> => {
	try {
		const response: AxiosResponse<DiscordUserProfile> =
			await axiosPollsInstance.get("/auth/me", {
				withCredentials: true,
			});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			return null;
		}

		console.error("Error fetching user:", error);
		throw error;
	}
};

export const signOut = async (): Promise<void> => {
	try {
		await axiosPollsInstance.post(
			"/auth/logout",
			{},
			{
				withCredentials: true,
			},
		);
	} catch (error) {
		console.error("Error signing out:", error);
		throw error;
	}
};
