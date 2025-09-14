"use client";

import { useIsMobile } from "@/utils/isMobile";
import Link from "next/link";
import type { ReactNode } from "react";
import styled from "styled-components";

const NavbarStyle = styled.nav`
  align-items: start;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const Section = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`;

const Center = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const Title = styled(Link)`
  align-items: center;
  display: flex;
  font-size: 3rem;
  font-stretch: expanded;
  font-weight: 700;
  gap: 1rem;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Logo = styled.img`
  border-radius: 0.5rem;
  width: 3rem;
`;

interface NavbarProps {
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
}

export default function Navbar({ leftComponent, rightComponent }: NavbarProps) {
  const isMobile = useIsMobile();

  return (
    <NavbarStyle>
      <Section style={{ justifyContent: "flex-start" }}>
        {leftComponent ?? <div />}
      </Section>
      <Center>
        <Title href="/">
          <Logo src="/img/logo.svg" alt="Marvel Discord Logo" />
          {(!(leftComponent || rightComponent) || !isMobile) &&
            "Marvel Discord"}
        </Title>
      </Center>
      <Section style={{ justifyContent: "flex-end" }}>
        {rightComponent ?? <div />}
      </Section>
    </NavbarStyle>
  );
}
