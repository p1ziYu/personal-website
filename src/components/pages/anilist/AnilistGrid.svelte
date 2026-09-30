<script lang="ts">
import ClientPagination from "@components/common/ClientPagination.svelte";
import { untrack } from "svelte";
import TabNav from "@/components/common/TabNav.svelte";
import type { AnilistEntry, AnilistListGroup } from "@/types/anilist";

interface Props {
	groups: AnilistListGroup[];
	itemsPerPage?: number;
}

let { groups, itemsPerPage = 24 }: Props = $props();

// 列表排序：在看优先，其次重温/计划/搁置，已看完/已弃靠后，自定义列表最后
const ORDER = ["Watching", "Rewatching", "Planning", "Paused", "Completed", "Dropped"];
const NAME_ZH: Record<string, string> = {
	Watching: "在看",
	Rewatching: "重温中",
	Planning: "计划",
	Paused: "搁置",
	Completed: "已看完",
	Dropped: "已弃",
};
const FORMAT_ZH: Record<string, string> = {
	TV: "TV",
	TV_SHORT: "TV",
	MOVIE: "剧场版",
	SPECIAL: "特别篇",
	OVA: "OVA",
	ONA: "ONA",
	MUSIC: "音乐",
};

let sorted = $derived(
	[...groups].sort((a, b) => {
		const ia = ORDER.indexOf(a.name);
		const ib = ORDER.indexOf(b.name);
		return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
	}),
);
let tabs = $derived(
	sorted.map((g) => ({ id: g.name, name: NAME_ZH[g.name] ?? g.name, count: g.entries.length })),
);
let activeTab = $state(untrack(() => sorted[0]?.name ?? ""));
let searchQuery = $state("");
let sortBy = $state("default");
let currentPage = $state(1);

function titleOf(e: AnilistEntry): string {
	return e.media.title.english || e.media.title.romaji || e.media.title.native || "未知标题";
}
function nativeOf(e: AnilistEntry): string {
	return e.media.title.native || "";
}
function yearOf(e: AnilistEntry): string {
	return e.media.startDate?.year ? String(e.media.startDate.year) : "";
}
function progressText(e: AnilistEntry): string {
	const p = e.progress ?? 0;
	const total = e.media.episodes;
	return total ? `${p}/${total} 话` : `${p} 话`;
}

let activeEntries = $derived(sorted.find((g) => g.name === activeTab)?.entries ?? []);

let filtered = $derived.by(() => {
	const q = searchQuery.trim().toLowerCase();
	const list = q
		? activeEntries.filter((e) => {
				const t = e.media.title;
				return [t.english, t.romaji, t.native].some(
					(x) => x && x.toLowerCase().includes(q),
				);
			})
		: [...activeEntries];
	switch (sortBy) {
		case "score-desc":
			list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
			break;
		case "avg-desc":
			list.sort((a, b) => (b.media.averageScore ?? -1) - (a.media.averageScore ?? -1));
			break;
		case "progress-desc":
			list.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
			break;
		case "title-asc":
			list.sort((a, b) => titleOf(a).localeCompare(titleOf(b), "zh"));
			break;
	}
	return list;
});

let pageItems = $derived(
	filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
);

function onTabChange(id: string) {
	activeTab = id;
	currentPage = 1;
	searchQuery = "";
}
function onPageChange(p: number) {
	currentPage = p;
}
</script>

<div class="mb-6">
	<TabNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} useHash={false} />
</div>

<!-- 搜索 + 排序 -->
<div class="flex flex-col sm:flex-row gap-3 mb-6">
	<div class="relative flex-1">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="搜索标题…"
			class="w-full rounded-xl border border-(--line-divider) bg-(--card-bg) px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/40"
		/>
	</div>
	<select
		bind:value={sortBy}
		class="rounded-xl border border-(--line-divider) bg-(--card-bg) px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none"
	>
		<option value="default">默认排序</option>
		<option value="score-desc">我的评分 ↓</option>
		<option value="avg-desc">平均分 ↓</option>
		<option value="progress-desc">观看进度 ↓</option>
		<option value="title-asc">标题 A-Z</option>
	</select>
</div>

{#if pageItems.length === 0}
	<div class="text-center py-16 text-neutral-500 dark:text-neutral-400">这个列表是空的</div>
{:else}
	<div class="media-grid grid gap-4">
		{#each pageItems as entry (entry.media.id)}
			<a
				href={entry.media.siteUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="group overflow-hidden rounded-xl border border-(--line-divider) bg-(--card-bg) transition-all hover:-translate-y-1 hover:shadow-lg"
			>
				<div class="relative aspect-[3/4] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
					{#if entry.media.coverImage?.large}
						<img
							src={entry.media.coverImage.large}
							alt={titleOf(entry)}
							loading="lazy"
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					{/if}
					{#if entry.score != null}
						<div
							class="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-0.5 text-xs font-semibold text-amber-300 backdrop-blur-sm"
						>
							★ {entry.score.toFixed(1)}
						</div>
					{/if}
				</div>
				<div class="p-3">
					<div class="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
						{titleOf(entry)}
					</div>
					{#if nativeOf(entry) && nativeOf(entry) !== titleOf(entry)}
						<div class="truncate text-xs text-neutral-500 dark:text-neutral-400">
							{nativeOf(entry)}
						</div>
					{/if}
					<div
						class="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400"
					>
						<span>{progressText(entry)}</span>
						<span>
							{entry.media.format ? (FORMAT_ZH[entry.media.format] ?? entry.media.format) : ""}
							{yearOf(entry) ? ` · ${yearOf(entry)}` : ""}
						</span>
					</div>
					{#if entry.media.averageScore != null}
						<div class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
							平均分 {(entry.media.averageScore / 10).toFixed(1)}
						</div>
					{/if}
				</div>
			</a>
		{/each}
	</div>
	<div class="mt-6">
		<ClientPagination
			totalItems={filtered.length}
			itemsPerPage={itemsPerPage}
			currentPage={currentPage}
			onPageChange={onPageChange}
		/>
	</div>
{/if}
