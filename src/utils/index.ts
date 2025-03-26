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
