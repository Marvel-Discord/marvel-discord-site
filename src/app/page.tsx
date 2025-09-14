"use client";

import { ContentWrapper } from "@/components";
import Link from "next/link";
import styled from "styled-components";
import type React from "react";
import Image from "next/image";
import { BackgroundWallpaper } from "@/components/staggeredBackground";

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 3rem;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const CentreContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  margin-block: 0;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const HeadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 7rem;
  font-weight: 700;
  font-stretch: expanded;

  @media (max-width: 768px) {
    font-size: 5rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  font-stretch: expanded;
  font-variation-settings: "slnt" -10;
  font-weight: 300;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ButtonStyle = styled.button`
  background-color: transparent;
  font-size: 1.5rem;
  padding-block: 0rem;
  padding-inline: 1rem;
  width: fit-content;
  font-weight: 300;
  font-stretch: semi-expanded;
  font-variation-settings: "slnt" -10;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translate(0.5rem);
  }
`;

const Button = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link href={href}>
      <ButtonStyle>
        <p>⇀ {children}</p>
      </ButtonStyle>
    </Link>
  );
};

const LogoWrapper = styled.div`
  border-radius: 2rem;
  height: 13rem;
  overflow: hidden;
  position: relative;
  width: 13rem;

  @media (max-width: 768px) {
    height: 10rem;
    width: 10rem;
  }
`;

const LogoImage = styled(Image).attrs({
  className: "logo",
  fill: true,
  priority: true,
})`
  inset: 0;
  object-fit: contain;
  position: absolute;
`;

const Logo = ({ alt }: { alt: string }) => (
  <LogoWrapper>
    <LogoImage src={"/img/icon_bg.svg"} alt={alt} />
    <BackgroundWallpaper
      $tileScale={0.5}
      $scrollSpeedX={2}
      $scrollSpeedY={1}
      $opacity={0.44}
      $withinParent
    />
    <LogoImage src={"/img/icon_vector.svg"} alt={alt} />
    {/* <LogoImage src={"/img/logo.svg"} alt={alt} /> */}
  </LogoWrapper>
);

export default function Home() {
  return (
    <ContentWrapper showNavbar={false} showFooter={false}>
      <CentreContent>
        <BodyWrapper>
          <Logo alt="Marvel Discord Logo" />
          <TextWrapper>
            <HeadingWrapper>
              <Title>Marvel Discord</Title>
              <Subtitle>
                The largest community-run server for everything Marvel.
              </Subtitle>
            </HeadingWrapper>
            <Buttons>
              <Button href="/invite">Join the server</Button>
              <Button href="/appeal">Make a ban appeal</Button>
              <Button href="/gallery">View the gallery</Button>
              <Button href="/polls">Vote on polls</Button>
            </Buttons>
          </TextWrapper>
        </BodyWrapper>
      </CentreContent>
      <BackgroundWallpaper
        $tileScale={1.5}
        $scrollSpeedX={20}
        $scrollSpeedY={10}
        $opacity={0.44}
      />
    </ContentWrapper>
  );
}
