export interface DiscordUserProfile {
  id: string;
  username: string;
  avatar?: string;
  global_name?: string;
  guilds?: {
    id: string;
    name: string;
  }[];
  accessToken?: string;
  isManager?: boolean;
}
