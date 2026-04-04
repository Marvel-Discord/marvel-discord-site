"use client";

import { useEffect, useState } from "react";
import styled, { css } from "styled-components";

type Props = {
  imagePath: string;
  pixelOffsetX: number;
  tileScale?: number;
  scrollSpeedX?: number;
  scrollSpeedY?: number;
  opacity?: number;
  originalTileSize?: number;
  withinParent?: boolean;
};

const Wrapper = styled.div<{ $withinParent: boolean }>`
  ${({ $withinParent }) =>
    $withinParent
      ? css`
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          mix-blend-mode: hard-light;
        `
      : css`
          position: fixed;
          inset: 0;
          z-index: -1;
          mix-blend-mode: soft-light;
        `}
  overflow: hidden;
  pointer-events: none;
`;

const TileContainer = styled.div<{
  $width: number;
  $height: number;
  $offsetX: number;
  $offsetY: number;
  $maxX: number;
  $maxY: number;
}>`
  position: absolute;
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  will-change: transform;
  transform: translate(
    ${({ $offsetX, $maxX }) => `-${$offsetX % $maxX}px`},
    ${({ $offsetY, $maxY }) => `-${$offsetY % $maxY}px`}
  );
`;

const Tile = styled.div<{
  $top: number;
  $left: number;
  $size: number;
  $backgroundImage: string;
  $opacity: number;
}>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-image: url(${({ $backgroundImage }) => $backgroundImage});
  background-size: cover;
  opacity: ${({ $opacity }) => $opacity};
`;
export default function StaggeredBackground({
  imagePath,
  pixelOffsetX,
  tileScale = 1.5,
  scrollSpeedX = 10,
  scrollSpeedY = 5,
  opacity = 0.44,
  originalTileSize = 4000,
  withinParent = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [tileSize, setTileSize] = useState(1000);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const expansionCount = 10;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateSize = () => {
      const maxDim = Math.max(window.innerWidth, window.innerHeight);
      setTileSize(maxDim * tileScale);
    };
    updateSize();

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [tileScale]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setOffset((prev) => ({
        x: prev.x + scrollSpeedX * delta,
        y: prev.y + scrollSpeedY * delta,
      }));

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [tileSize, scrollSpeedX, scrollSpeedY, pixelOffsetX, tileScale]);

  if (!mounted) return null;

  const scaleRatio = tileSize / originalTileSize;
  const scaledOffset = pixelOffsetX * scaleRatio;

  const numCols = window
    ? Math.ceil(window.innerWidth / tileSize) + expansionCount
    : 0;
  const numRows = window
    ? Math.ceil(window.innerHeight / tileSize) + expansionCount
    : 0;

  const tiles = [];
  for (let x = -1; x < numCols; x++) {
    for (let y = -1; y < numRows; y++) {
      tiles.push(
        <Tile
          key={`${x}-${y}`}
          $top={y * tileSize + x * scaledOffset}
          $left={x * tileSize}
          $size={tileSize}
          $backgroundImage={imagePath}
          $opacity={opacity}
        />,
      );
    }
  }

  return (
    <Wrapper $withinParent={withinParent}>
      <TileContainer
        $width={tileSize * numCols}
        $height={tileSize * numRows + scaledOffset * numCols}
        $offsetX={offset.x}
        $offsetY={offset.y}
        $maxX={tileSize * expansionCount}
        $maxY={(tileSize + scaledOffset) * expansionCount}
      >
        {tiles}
      </TileContainer>
    </Wrapper>
  );
}

export function BackgroundWallpaper({
  $tileScale,
  $opacity,
  $scrollSpeedX,
  $scrollSpeedY,
  $withinParent = false,
}: {
  $tileScale: number;
  $opacity: number;
  $scrollSpeedX: number;
  $scrollSpeedY: number;
  $withinParent?: boolean;
}) {
  return (
    <StaggeredBackground
      imagePath="/img/tile.webp"
      pixelOffsetX={1465}
      tileScale={$tileScale}
      scrollSpeedX={$scrollSpeedX}
      scrollSpeedY={$scrollSpeedY}
      opacity={$opacity}
      originalTileSize={4000}
      withinParent={$withinParent}
    />
  );
}
