import type { Metadata } from "next";
import { relativeImagePathToAbsolute } from "@/utils";

export const pollsMetadata: Metadata = {
  title: "Marvel Discord Polls",
  description: "Vote on Marvel polls – created by the Marvel Discord",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "Marvel Discord Polls",
    description: "Vote on Marvel polls – created by the Marvel Discord",
    siteName: "Marvel Discord",
    images: [
      relativeImagePathToAbsolute(
        "/img/gallery/banner/Marvel Discord Banner.png"
      ),
    ],
  },
};
