import type { Metadata } from "next";
import { pollsMetadata } from "./metadata";
import PollsClientLayout from "./client-layout";

export const metadata: Metadata = pollsMetadata;

export default function PollsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PollsClientLayout>{children}</PollsClientLayout>;
}
