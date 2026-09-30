import type { AnilistEntry, AnilistListGroup, AnilistMedia } from "@/types/anilist";

const ANILIST_API = "https://graphql.anilist.co";

const QUERY = `
query ($userName: String) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      name
      entries {
        status
        score(format: POINT_10_DECIMAL)
        progress
        updatedAt
        media {
          id
          title { romaji english native }
          coverImage { large medium }
          averageScore
          episodes
          format
          status
          startDate { year month day }
          siteUrl
          genres
          isAdult
        }
      }
    }
  }
}`;

interface RawEntry {
	status?: string | null;
	score?: number | null;
	progress?: number | null;
	updatedAt?: number | null;
	media?: (Omit<AnilistMedia, "genres"> & { genres?: string[] | null; isAdult?: boolean | null }) | null;
}

/** 拉取指定用户的 AniList 动画列表（公开 API，无需鉴权；自动过滤 R18 内容） */
export async function fetchAnilistLists(userName: string): Promise<AnilistListGroup[]> {
	const res = await fetch(ANILIST_API, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		body: JSON.stringify({ query: QUERY, variables: { userName } }),
	});
	if (!res.ok) {
		throw new Error(`AniList API error: ${res.status}`);
	}
	const json = await res.json();
	const lists = json?.data?.MediaListCollection?.lists;
	if (!lists) {
		const msg = json?.errors?.[0]?.message || "unknown error";
		throw new Error(`AniList user not found or list is private (${userName}): ${msg}`);
	}

	return (lists as { name?: string | null; entries?: RawEntry[] | null }[])
		.map((list) => {
			const entries: AnilistEntry[] = (list.entries || [])
				.filter((e) => e?.media && !e.media.isAdult)
				.map((e) => ({
					status: e.status ?? null,
					// POINT_10_DECIMAL 是 0-100，换算成 0-10；0 表示未评分
					score: typeof e.score === "number" && e.score > 0 ? e.score / 10 : null,
					progress: e.progress ?? null,
					updatedAt: e.updatedAt ?? null,
					media: {
						id: e.media!.id,
						title: e.media!.title || {},
						coverImage: e.media!.coverImage || null,
						averageScore: e.media!.averageScore ?? null,
						episodes: e.media!.episodes ?? null,
						format: e.media!.format ?? null,
						status: e.media!.status ?? null,
						startDate: e.media!.startDate || null,
						siteUrl: e.media!.siteUrl || null,
						genres: e.media!.genres || [],
					},
				}));
			return { name: String(list.name || ""), entries };
		})
		.filter((g) => g.name && g.entries.length > 0);
}
