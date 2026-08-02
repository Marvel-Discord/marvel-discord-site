import type { Poll } from "@/types/jocasta";
import config from "@/app/config/config";

let currentPollId = 0;

export function emptyPoll(): Poll {
  currentPollId--;
  return {
    id: currentPollId,
    question: "",
    description: "",
    image: "",
    votes: [],
    total_votes: 0,
    tag: 0,
    guild_id: BigInt(config.guildId),
    published: false,
    active: false,
    choices: [],
    time: null,
    num: null,
    message_id: null,
    crosspost_message_ids: [],
    thread_question: "",
    show_question: true,
    show_options: true,
    show_voting: true,
    fallback: false,
  };
}
