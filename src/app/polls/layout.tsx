"use client";

import { Navbar } from "@/components";
import { Container, Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";

import styled from "styled-components";
import { AuthProvider } from "@/contexts/AuthProvider";
import ProfileContainer from "@/components/polls/profileButton";
import { TagProvider } from "@/contexts/TagContext";

import "@radix-ui/themes/styles.css";
import "./polls-globals.css";

const BaseContainer = styled(Container)`
  margin-inline: 1rem;
`;

export default function PollsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <TagProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Theme accentColor="red" radius="large" scaling="110%">
            <Navbar rightComponent={<ProfileContainer />} />
            <BaseContainer size="4">{children}</BaseContainer>
          </Theme>
        </ThemeProvider>
      </TagProvider>
    </AuthProvider>
  );
}
