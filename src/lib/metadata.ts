import { relativeImagePathToAbsolute } from "@/utils";
import type { Metadata, Viewport } from "next";

export const defaultMetadata: Metadata = {
  title: "Marvel Discord",
  description: "The largest community-run server for everything Marvel.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "Marvel Discord",
    description: "The largest community-run server for everything Marvel.",
    siteName: "Marvel Discord",
    images: [
      relativeImagePathToAbsolute(
        "/img/gallery/banner/Marvel Discord Banner.png"
      ),
    ],
  },
};

export const defaultViewport: Viewport = {
  themeColor: "#ea2328",
};
