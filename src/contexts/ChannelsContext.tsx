import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getGuildChannels, Channel } from "@/api/discord/channels";

interface ChannelsContextValue {
  channels: Channel[];
  getChannelName: (id: string) => string | undefined;
  loading: boolean;
  error: unknown;
}

const ChannelsContext = createContext<ChannelsContextValue | undefined>(
  undefined
);

export function ChannelsProvider({
  guildId,
  children,
}: {
  guildId: string;
  children: ReactNode;
}) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);
    getGuildChannels(guildId)
      .then((chs) => {
        setChannels(chs);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [guildId]);

  const getChannelName = (id: string) =>
    channels.find((c) => c.id === id)?.name;

  return (
    <ChannelsContext.Provider
      value={{ channels, getChannelName, loading, error }}
    >
      {children}
    </ChannelsContext.Provider>
  );
}

export function useChannels() {
  const ctx = useContext(ChannelsContext);
  if (!ctx)
    throw new Error("useChannels must be used within a ChannelsProvider");
  return ctx;
}
