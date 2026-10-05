import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
import type { NavBarLink } from "@/types/navBarConfig";
import { hasEnglishVersion, isEnPath } from "./route-manifest";

// 导航栏菜单名称的 i18n 解析
// 思路：把「默认菜单名」映射到对应的 i18n key。
// 渲染时若 name 未被用户修改（仍等于默认值），就用 i18n 翻译；
// 若用户改了 name（不再是默认值），映射不命中，保留自定义名称。
// VNDB / AnimeList 等品牌名各语言一致，不放入映射，保持原名。

const NAVBAR_DEFAULT_NAMES: Record<string, I18nKey> = {
	// 分组
	文章: I18nKey.navArticles,
	社交: I18nKey.navSocial,
	我的: I18nKey.navMine,
	关于: I18nKey.navAbout,
	链接: I18nKey.navLinks,
	// 页面
	主页: I18nKey.home,
	归档: I18nKey.archive,
	分类: I18nKey.categories,
	标签: I18nKey.tags,
	系列: I18nKey.series,
	友链: I18nKey.friends,
	留言: I18nKey.guestbook,
	动态: I18nKey.dynamic,
	项目: I18nKey.projects,
	相册: I18nKey.gallery,
	书签导航: I18nKey.booknav,
	哔哩哔哩: I18nKey.bilibili,
	番组计划: I18nKey.bangumi,
	打赏: I18nKey.sponsor,
	关于我: I18nKey.about,
};

const NAVBAR_EN_MAP: Record<string, string> = {
	文章: "Articles",
	社交: "Social",
	我的: "My",
	关于: "About",
	链接: "Links",
	主页: "Home",
	归档: "Archive",
	分类: "Categories",
	标签: "Tags",
	系列: "Series",
	友链: "Friends",
	留言: "Guestbook",
	动态: "Moments",
	项目: "Projects",
	像素墙: "Pixel Wall",
	相册: "Gallery",
	书签导航: "Bookmarks",
	哔哩哔哩: "Bilibili",
	追番: "Anime",
	番组计划: "Bangumi",
	打赏: "Sponsor",
	支持本站: "Support",
	关于我: "About Me",
	"RSS 订阅": "RSS",
	AniList: "AniList",
};

export function resolveNavbarName(name: string, lang?: string): string {
	if (lang === "en") {
		if (NAVBAR_EN_MAP[name]) return NAVBAR_EN_MAP[name];
		const key = NAVBAR_DEFAULT_NAMES[name];
		return key ? i18n(key, "en") : name;
	}
	const key = NAVBAR_DEFAULT_NAMES[name];
	return key ? i18n(key, lang) : name;
}

export function resolveNavbarNameBoth(name: string): {
	zh: string;
	en: string;
} {
	const key = NAVBAR_DEFAULT_NAMES[name];
	const zh = key ? i18n(key, "zh_CN") : name;
	const en = NAVBAR_EN_MAP[name] || (key ? i18n(key, "en") : name);
	return { zh, en };
}

export function resolveNavbarLinks(
	links: NavBarLink[],
	lang?: string,
): NavBarLink[] {
	return links.map((link) => {
		const resolved: NavBarLink = {
			...link,
			name: resolveNavbarName(link.name, lang),
			url:
				lang === "en" &&
				!link.external &&
				link.url.startsWith("/") &&
				!isEnPath(link.url) &&
				hasEnglishVersion(link.url)
					? link.url === "/"
						? "/en/"
						: `/en${link.url}`
					: link.url,
		};
		if (link.children) {
			resolved.children = resolveNavbarLinks(link.children, lang);
		}
		return resolved;
	});
}
