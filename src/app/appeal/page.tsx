"use client";

import { ContentWrapper } from "@/components";
import Link from "next/link";
import type React from "react";
import styled from "styled-components";
import config from "../config/config";

const TextWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  gap: 1rem;

  h1 {
    font-size: 3rem;
    font-weight: 400;
    font-stretch: expanded;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 300;
    font-variation-settings: "slnt" -10;
  }

  ol,
  ul {
    padding-inline-start: 2rem;
    line-height: 1.5;
  }
`;

const LinkStyled = styled.a`
  color: var(--highlight);

  &:hover {
    text-decoration: underline;
  }
`;

export default function AppealPage() {
  return (
    <ContentWrapper>
      <TextWrapper>
        <TextContent>
          <h1>Appeals</h1>
          <h2>Help, how can I get unbanned?</h2>
          <p>To appeal a ban, please follow the instructions below.</p>
          <ol>
            <li>
              Join the{" "}
              <LinkStyled href={config.postOfficeInviteUrl || "#"}>
                Marvel Discord Post Office
              </LinkStyled>{" "}
              server.
            </li>
            <li>Send your appeal via DM to the Marvel Modmail bot.</li>
          </ol>
          <span />
          <p>For the appeal to be considered:</p>
          <ul>
            <li>The appeal must be made from the account that was banned.</li>
            <li>
              Please provide all context possible, including your understanding
              of what prompted the ban.
            </li>
            <li>Explain why you believe your ban should be repealed.</li>
          </ul>
          <span />
          <p>
            A moderator will respond to your appeal once a decision is made. The
            timeframe for this will vary depending on the availability of the
            moderation team, however, all appeals are responded to.
          </p>
        </TextContent>
      </TextWrapper>
    </ContentWrapper>
  );
}
