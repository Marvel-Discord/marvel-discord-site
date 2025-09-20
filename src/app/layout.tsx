import type { Metadata, Viewport } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import { defaultMetadata, defaultViewport } from "@/lib/metadata";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster richColors theme="system" />
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
