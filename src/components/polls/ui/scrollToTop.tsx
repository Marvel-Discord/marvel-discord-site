import { IconButton } from "@radix-ui/themes";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import styled from "styled-components";

const ScrollToTopButtonStyle = styled(IconButton)<{ $isVisible: boolean }>`
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
  pointer-events: ${({ $isVisible }) => ($isVisible ? "auto" : "none")};
`;

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <ScrollToTopButtonStyle
      onClick={scrollToTop}
      variant="surface"
      size="2"
      aria-label="Scroll to top"
      $isVisible={isVisible}
    >
      <ChevronUp />
    </ScrollToTopButtonStyle>
  );
}
