import type { Metadata } from "next";
import { relativeImagePathToAbsolute } from "@/utils";
import GiveawaysRedirect from "./redirect";

const giveawaysTitle = "Marvel Discord Giveaways";
const giveawaysDescription =
  "Check out the latest Marvel Discord giveaways and events.";

export const metadata: Metadata = {
  title: giveawaysTitle,
  description: giveawaysDescription,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: giveawaysTitle,
    description: giveawaysDescription,
    siteName: "Marvel Discord",
    url: "/giveaways",
    images: [
      relativeImagePathToAbsolute(
        "/img/gallery/banner/Marvel Discord Banner.png",
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: giveawaysTitle,
    description: giveawaysDescription,
    images: [
      relativeImagePathToAbsolute(
        "/img/gallery/banner/Marvel Discord Banner.png",
      ),
    ],
  },
};

export default function GiveawaysPage() {
  return <GiveawaysRedirect />;
}
