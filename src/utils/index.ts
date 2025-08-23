import config from "@/app/config/config";
import type { Tag } from "@jocasta-polls-api";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export function formatGalleryEntryTitle(title: string) {
  return title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/ /g, "-")
    .toLowerCase();
}

export function relativeImagePathToAbsolute(relativePath: string): string {
  return `${config.publicBaseUrl}${relativePath}`;
}

export function intToColorHex(int: number): string {
  const hex = int.toString(16).padStart(6, "0");
  return `#${hex}`;
}

export function getContrastColorFromInt(color: number): string {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000000" : "#ffffff";
}

export function getTagColors(tag?: Tag) {
  if (!tag) {
    return { backgroundColor: undefined, textColor: undefined };
  }

  const tagColor = tag.colour ? tag.colour : null;
  const backgroundColor = tagColor ? intToColorHex(tagColor) : "var(--red-9)";
  const textColor = tagColor ? getContrastColorFromInt(tagColor) : undefined;
  return { backgroundColor, textColor };
}

export function updateUrlParameters(
  router: AppRouterInstance,
  currentParams: URLSearchParams,
  newParams: Record<string, string | number | boolean | null | undefined>
) {
  const searchParams = new URLSearchParams(currentParams.toString());
  for (const [key, value] of Object.entries(newParams)) {
    if (value === null || value === undefined) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, String(value));
    }
  }
  router.replace(`?${searchParams.toString()}`, { scroll: false });
}

export function randomText(min = 5, max = 50) {
  const length = getRandomInt(min, max);
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function skeletonText(min = 5, max = 50) {
  // Generate consistent placeholder text for skeletons to avoid hydration mismatches
  const length = Math.floor((min + max) / 2); // Use average length for consistency
  const placeholder = "Lorem ipsum dolor sit amet consectetur adipiscing elit";
  return placeholder.substring(0, length).trim();
}

export function getRandomInt(min = 5, max = 50) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createDefaultAvatarUrl(userId: bigint): string {
  const BIT_SHIFT_VALUE = BigInt(22);
  const NUMBER_OF_AVATARS = BigInt(6);
  const avatarId = (userId >> BIT_SHIFT_VALUE) % NUMBER_OF_AVATARS;

  return `https://cdn.discordapp.com/embed/avatars/${avatarId}.png`;
}

export function getProfilePictureUrlFromHash(
  userId: bigint,
  profilePictureHash: string | null
): string {
  if (!profilePictureHash) {
    return createDefaultAvatarUrl(userId);
  }

  return createCustomAvatarUrl(userId, profilePictureHash);
}

export function createCustomAvatarUrl(
  userId: bigint,
  profilePictureHash: string
): string {
  return `https://cdn.discordapp.com/avatars/${userId}/${profilePictureHash}.png`;
}

export const pollDescriptionAuthorshipRegex =
  /\n?\s*(\w+)\s+by\s+@?(\w+)\s+\(<@(\d+)>\)/;

export const pollDescriptionAnonymousAuthorshipRegex =
  /\n?\s*(\w+)\s+by Anonymous/;

export const pollDescriptionArtRegex =
  /((?:[\w]+ )*?[Aa]rt) by (((\w\.?\w*)[ &-]*)+)\.?/g;

const descriptionRegexes = [
  pollDescriptionAuthorshipRegex,
  pollDescriptionAnonymousAuthorshipRegex,
  pollDescriptionArtRegex,
];

export function filterDescriptionWithRegex(description?: string | null) {
  return description
    ? descriptionRegexes
        .reduce((text, regex) => text.replace(regex, ""), description)
        .trim()
    : null;
}

export function extractDescriptionWithRegex(description?: string | null) {
  if (!description) return null;

  const matches = descriptionRegexes.flatMap((regex) =>
    regex.global
      ? [...description.matchAll(regex)].map((m) => m[0].trim())
      : description.match(regex)
      ? [description.match(regex)?.[0].trim()]
      : []
  );

  return matches.join(" ");
}

export enum PollSearchType {
  ID = "id",
  SEARCH = "search",
}

export function trimRunningStringSingleLine(str: string): string {
  return str.replace(/^[ \t]+/, "").replace(/^\n+|\n+$/g, "");
}

export function trimRunningStringMultiLine(str: string): string {
  return str.replace(/^[ \t]+/, "").replace(/^\n+/g, "");
}

export function cleanUrlSafeString(str: string): string {
  return trimRunningStringSingleLine(str).replace(
    /[^A-Za-z0-9\-._~:/?#\[\]@!$&'()*+,;=%]/g,
    ""
  );
}
