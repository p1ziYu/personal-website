/**
 * Route manifest for English localization support.
 * Defines routes that have an English counterpart.
 */

export const ENGLISH_STATIC_ROUTES: ReadonlySet<string> = new Set<string>([
	"/",
	"/about/",
	"/archive/",
	"/categories/",
	"/tags/",
	"/friends/",
	"/guestbook/",
	"/search/",
	"/projects/",
]);

export const ENGLISH_PROJECT_SLUGS: ReadonlySet<string> = new Set<string>([
	"adrift",
	"cursed-fonts",
	"emberhold-siege",
	"event-horizon",
	"goldilocks-ink",
	"kinetic-cuisine",
	"snake",
	"the-last-scan",
	"the-smallest-triangle",
]);

export const ENGLISH_POST_SLUGS: ReadonlySet<string> = new Set<string>([
	"start-here",
	"eighty-one-tribulations",
	"an-address-of-ones-own",
	"a-beautiful-misunderstanding",
	"writing-on-firefly",
]);

/**
 * Check if the given pathname represents an English route.
 * Segment-aware: matches "/en" or "/en/..." but NOT "/energy/".
 */
export function isEnPath(pathname: string): boolean {
	return (
		pathname === "/en" || pathname === "/en/" || pathname.startsWith("/en/")
	);
}

/**
 * Strip query params, hash, and language prefix to get the normalized canonical Chinese path.
 * Always ensures leading slash and (unless root) trailing slash.
 */
export function getCanonicalPath(pathname: string): string {
	let path = pathname.split("?")[0].split("#")[0];
	if (path.startsWith("/en/")) {
		path = path.substring(3);
	} else if (path === "/en") {
		path = "/";
	}
	if (!path.startsWith("/")) {
		path = `/${path}`;
	}
	if (path.length > 1 && !path.endsWith("/")) {
		path = `${path}/`;
	}
	return path;
}

/**
 * Check whether a given path actually has an English version.
 */
export function hasEnglishVersion(pathname: string): boolean {
	const canonical = getCanonicalPath(pathname);

	if (ENGLISH_STATIC_ROUTES.has(canonical)) {
		return true;
	}

	// Home pagination (e.g. /2/, /3/)
	if (/^\/\d+\/$/.test(canonical)) {
		return true;
	}

	// Projects: /projects/:slug/
	if (canonical.startsWith("/projects/")) {
		const slug = canonical.slice("/projects/".length).replace(/\/$/, "");
		if (ENGLISH_PROJECT_SLUGS.has(slug)) {
			return true;
		}
	}

	// Posts: /posts/:slug/
	if (canonical.startsWith("/posts/")) {
		const slug = canonical.slice("/posts/".length).replace(/\/$/, "");
		if (ENGLISH_POST_SLUGS.has(slug)) {
			return true;
		}
	}

	return false;
}

/**
 * Get the corresponding English path for a given route, or null if no English version exists.
 */
export function getEnglishPath(pathname: string): string | null {
	if (!hasEnglishVersion(pathname)) {
		return null;
	}
	const canonical = getCanonicalPath(pathname);
	return canonical === "/" ? "/en/" : `/en${canonical}`;
}

/**
 * Get the localized URL for a target path without producing 404s.
 */
export function getLocalizedUrl(
	targetUrl: string,
	targetLang: "en" | "zh",
): string {
	if (!targetUrl.startsWith("/") || targetUrl.startsWith("//")) {
		return targetUrl;
	}
	if (targetLang === "en") {
		const enPath = getEnglishPath(targetUrl);
		return enPath ?? getCanonicalPath(targetUrl);
	}
	return getCanonicalPath(targetUrl);
}
