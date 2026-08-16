"use client";

import type React from "react";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import styled from "styled-components";

import type { GalleryEntry } from "@/types";
import { formatDate, formatGalleryEntryTitle } from "@/utils";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";
import { EmblaContainer, EmblaSlide, EmblaImage, EmblaWrapper } from "./embla";
import { Button, LinkButton } from "../button";
import AutoHeight from "embla-carousel-auto-height";
import { useRouter, useSearchParams } from "next/navigation";

const GalleryWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
`;

const EntryDetails = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  width: 30rem;

  @media (max-width: 768px) {
    max-width: calc(100vw - 2rem);
  }
`;

const EntryTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  font-stretch: expanded;
`;

const EntrySubtext = styled.p`
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.1rem;
`;

const EntryDescription = styled.p`
  font-size: 1rem;
  letter-spacing: 0.02rem;
`;

const GalleryDetails = styled.div`
  display: flex;
  flex-direction: row;
`;

const ThumbEmblaContainer = styled(EmblaContainer)`
  gap: 0.6rem;
`;

const ThumbEmblaSlide = styled(EmblaSlide)`
  flex: 0 0 auto;
  max-width: 8%;

  &:not(.is-snapped) {
    opacity: 0.4;
  }

  @media (max-width: 768px) {
    max-width: 25%;
  }
`;

const ThumbEmblaImage = styled(EmblaImage)`
  border-radius: 0.5rem;
  max-height: 30rem;

  @media (max-width: 768px) {
    max-height: 20rem;
  }
`;

const MainEmblaContainer = styled(EmblaContainer)`
  align-items: flex-start;
  gap: 1rem;
`;

const MainEmblaSlide = styled(EmblaSlide)`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  max-width: 80%;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const MainEmblaImage = styled(EmblaImage)`
  max-height: 30rem;

  @media (max-width: 768px) {
    max-height: 20rem;
  }
`;

const ImageButtons = styled.div<{ $isVisible: boolean }>`
  display: flex;
  gap: 0.5rem;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: ${({ $isVisible }) => ($isVisible ? "auto" : "none")};
  transition: opacity 0.2s ease;
`;

const SlideButtonStyled = styled(Button)<{ $isDisabled?: boolean }>`
  ${({ $isDisabled }) => $isDisabled && "pointer-events: none; opacity: 0.5;"};

  @media (max-width: 768px) {
    display: none;
  }
`;

function SlideButton({
  children,
  onClick,
  isDisabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
}) {
  return (
    <SlideButtonStyled onClick={onClick} $isDisabled={isDisabled}>
      {children}
    </SlideButtonStyled>
  );
}

interface CarouselProps {
  galleryEntries: GalleryEntry[];
}

export default function Carousel({ galleryEntries }: CarouselProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  galleryEntries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const [thumbEmblaRef, thumbEmblaApi] = useEmblaCarousel(
    {
      align: "center",
      containScroll: false,
    },
    [ClassNames(), AutoHeight()]
  );

  const [mainEmblaRef, mainEmblaApi] = useEmblaCarousel(
    {
      align: "center",
      containScroll: false,
    },
    [ClassNames(), AutoHeight()]
  );

  const [thumbSelectedIndex, setThumbSelectedIndex] = useState(0);
  const [mainSelectedIndex, setMainSelectedIndex] = useState(0);
  const selectedEntry = galleryEntries[thumbSelectedIndex];

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!thumbEmblaApi || isLoaded) return;

    const searchParams = new URLSearchParams(window.location.search);
    const slideTitle = searchParams.get("slide");

    if (slideTitle) {
      const index = galleryEntries.findIndex(
        (entry) => formatGalleryEntryTitle(entry.title) === slideTitle
      );
      if (index !== -1) {
        thumbEmblaApi?.scrollTo(index, true);
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- pre-existing: isLoaded gates the URL-sync effect below; setting it outside this effect requires restructuring the initial slide-sync behavior
    setIsLoaded(true);
  }, [galleryEntries, thumbEmblaApi, isLoaded]);

  useEffect(() => {
    if (!isLoaded || !galleryEntries[thumbSelectedIndex]) return;
    const newSlide = formatGalleryEntryTitle(
      galleryEntries[thumbSelectedIndex].title
    );
    const currentSlide = searchParams.get("slide");
    if (currentSlide === newSlide) return;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("slide", newSlide);
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  }, [isLoaded, thumbSelectedIndex, router, galleryEntries, searchParams]);

  useEffect(() => {
    if (!thumbEmblaApi) return;

    const onSelect = () => {
      setThumbSelectedIndex(thumbEmblaApi.selectedScrollSnap());
    };

    thumbEmblaApi.on("select", onSelect);
    onSelect();

    return () => {
      thumbEmblaApi.off("select", onSelect);
    };
  }, [thumbEmblaApi]);

  useEffect(() => {
    if (!mainEmblaApi) return;

    const onSelect = () => {
      setMainSelectedIndex(mainEmblaApi.selectedScrollSnap());
    };

    mainEmblaApi.on("select", onSelect);
    onSelect();

    return () => {
      mainEmblaApi.off("select", onSelect);
    };
  }, [mainEmblaApi]);

  useEffect(() => {
    if (!thumbEmblaApi) return;

    const onThumbSelect = () => {
      setThumbSelectedIndex(thumbEmblaApi.selectedScrollSnap());
      setMainSelectedIndex(0);
      mainEmblaApi?.scrollTo(0, true);
    };

    thumbEmblaApi.on("select", onThumbSelect);
    onThumbSelect();

    return () => {
      thumbEmblaApi.off("select", onThumbSelect);
    };
  }, [thumbEmblaApi, mainEmblaApi]);

  return (
    <GalleryWrapper>
      <EmblaWrapper ref={thumbEmblaRef}>
        <ThumbEmblaContainer>
          {galleryEntries.map((entry, index) => (
            <ThumbEmblaSlide key={entry.title}>
              <button
                type="button"
                onClick={() => {
                  thumbEmblaApi?.scrollTo(index);
                  mainEmblaApi?.scrollTo(0);
                }}
              >
                <ThumbEmblaImage
                  src={entry.imageUrls[entry.previewImageIndex ?? 0]}
                  alt={entry.title}
                  width={1000}
                  height={1000}
                  unoptimized={entry.imageUrls[0].endsWith(".gif")}
                />
              </button>
            </ThumbEmblaSlide>
          ))}
        </ThumbEmblaContainer>
      </EmblaWrapper>

      <EmblaWrapper ref={mainEmblaRef}>
        <MainEmblaContainer>
          {selectedEntry.imageUrls.map((entry, index) => (
            <MainEmblaSlide key={entry}>
              <MainEmblaImage
                src={entry}
                alt={selectedEntry.title}
                width={1000}
                height={1000}
                unoptimized={entry.endsWith(".gif")}
              />
              <ImageButtons $isVisible={index === mainSelectedIndex}>
                <LinkButton href={entry} target="_blank" download>
                  <Download />
                </LinkButton>
                <LinkButton href={entry} target="_blank">
                  <ExternalLink />
                </LinkButton>
              </ImageButtons>
            </MainEmblaSlide>
          ))}
        </MainEmblaContainer>
      </EmblaWrapper>

      <GalleryDetails>
        <SlideButton
          onClick={() => thumbEmblaApi?.scrollPrev()}
          isDisabled={thumbSelectedIndex === 0}
        >
          <ChevronFirst />
        </SlideButton>
        <SlideButton
          onClick={() => mainEmblaApi?.scrollPrev()}
          isDisabled={mainSelectedIndex === 0}
        >
          <ChevronLeft />
        </SlideButton>

        <EntryDetails>
          <EntryTitle>{selectedEntry.title}</EntryTitle>
          {selectedEntry.date || selectedEntry.creator ? (
            <EntrySubtext>
              {[
                selectedEntry.date && formatDate(selectedEntry.date),
                selectedEntry.creator && `Made by ${selectedEntry.creator}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </EntrySubtext>
          ) : null}
          {selectedEntry.description && (
            <EntryDescription>{selectedEntry.description}</EntryDescription>
          )}
        </EntryDetails>

        <SlideButton
          onClick={() => mainEmblaApi?.scrollNext()}
          isDisabled={mainSelectedIndex === selectedEntry.imageUrls.length - 1}
        >
          <ChevronRight />
        </SlideButton>
        <SlideButton
          onClick={() => thumbEmblaApi?.scrollNext()}
          isDisabled={thumbSelectedIndex === galleryEntries.length - 1}
        >
          <ChevronLast />
        </SlideButton>
      </GalleryDetails>
    </GalleryWrapper>
  );
}
