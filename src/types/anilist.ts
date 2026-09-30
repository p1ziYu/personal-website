// AniList 追番功能 TypeScript 接口定义

export interface AnilistTitle {
	romaji?: string | null;
	english?: string | null;
	native?: string | null;
}

export interface AnilistCoverImage {
	large?: string | null;
	medium?: string | null;
}

export interface AnilistDate {
	year?: number | null;
	month?: number | null;
	day?: number | null;
}

export interface AnilistMedia {
	id: number;
	title: AnilistTitle;
	coverImage?: AnilistCoverImage | null;
	averageScore?: number | null; // 0-100
	episodes?: number | null;
	format?: string | null;
	status?: string | null;
	startDate?: AnilistDate | null;
	siteUrl?: string | null;
	genres?: string[];
}

export interface AnilistEntry {
	status?: string | null; // MediaListStatus: CURRENT/PLANNING/COMPLETED/DROPPED/PAUSED/REPEATING
	score?: number | null; // 我的评分，0-10
	progress?: number | null; // 已看话数
	updatedAt?: number | null;
	media: AnilistMedia;
}

export interface AnilistListGroup {
	name: string; // Watching / Planning / Completed / Dropped / Paused / Rewatching / 自定义
	entries: AnilistEntry[];
}
