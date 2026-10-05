import rss, { type RSSFeedItem } from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { renderFeedEntries } from "@utils/feed-utils";
import type { APIContext } from "astro";
import { siteConfig } from "@/config";
import pkg from "../../../package.json";

export const prerender = true;

export async function GET(context: APIContext): Promise<Response> {
	const includeContent = (siteConfig.feed?.contentMode ?? "full") === "full";
	const blog = await getSortedPosts("en");
	const entries = await renderFeedEntries(blog, { includeContent });
	const feedItems: RSSFeedItem[] = entries.map((entry) => ({
		title: entry.title,
		pubDate: entry.published,
		description: entry.description,
		link: entry.link,
		...(includeContent ? { content: entry.content } : {}),
	}));
	return rss({
		title: "p1ziYu’s Space",
		description: "What you love is your life.",
		site: context.site ?? siteConfig.site_url,
		customData: `<language>en</language><templateTheme>Firefly</templateTheme>
		<templateThemeVersion>${pkg.version}</templateThemeVersion>
		<templateThemeUrl>https://github.com/CuteLeaf/Firefly</templateThemeUrl>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
		items: feedItems,
	});
}
