import config from "@/app/config/config";

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
