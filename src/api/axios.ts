import axios from "axios";
import config from "@/app/config/config";

export const axiosPollsInstance = axios.create({
	baseURL: config.apiUrlPolls,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});
