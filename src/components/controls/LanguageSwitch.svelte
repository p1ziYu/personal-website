<script lang="ts">
import { onMount } from "svelte";
import { siteConfig } from "@/config";
import { hasEnglishVersion, isEnPath } from "@/utils/route-manifest";

interface SwupHooks {
	on(event: string, callback: () => void): void;
}

interface SwupInstance {
	hooks?: SwupHooks;
	navigate(url: string): void;
}

interface Props {
	initialIsEn?: boolean;
	initialHasEn?: boolean;
}

let { initialIsEn = false, initialHasEn = true }: Props = $props();
let isEn = $state(initialIsEn);
let hasEn = $state(initialHasEn);

let canSwitch = $derived(isEn || hasEn);

function checkCurrentLang() {
	if (typeof window !== "undefined") {
		const path = window.location.pathname;
		isEn = isEnPath(path);
		hasEn = isEn || hasEnglishVersion(path);
		document.documentElement.lang = isEn ? "en" : "zh-CN";
		document.documentElement.setAttribute("data-lang", isEn ? "en" : "zh");
	}
}

function toggleLanguage() {
	const currentPath = window.location.pathname;
	const currentlyEn = isEnPath(currentPath);
	const newIsEn = !currentlyEn;

	if (newIsEn && !hasEnglishVersion(currentPath)) {
		return;
	}

	const targetLang = newIsEn ? "en" : "zh_CN";
	try {
		localStorage.setItem("site-lang", targetLang);
	} catch (e) {}

	let targetPath = currentPath;
	if (newIsEn) {
		if (!isEnPath(currentPath)) {
			targetPath = `/en${currentPath === "/" ? "/" : currentPath}`;
		}
	} else {
		if (currentPath.startsWith("/en/")) {
			targetPath = currentPath.substring(3);
		} else if (currentPath === "/en") {
			targetPath = "/";
		}
	}

	const targetUrl = targetPath + window.location.search + window.location.hash;

	isEn = newIsEn;
	document.documentElement.lang = newIsEn ? "en" : "zh-CN";
	document.documentElement.setAttribute("data-lang", newIsEn ? "en" : "zh");
	window.dispatchEvent(
		new CustomEvent("lang-change", {
			detail: { lang: targetLang, isEn: newIsEn },
		}),
	);

	const win = window as WindowWithSwup;
	if (win.swup && typeof win.swup.navigate === "function") {
		win.swup.navigate(targetUrl);
	} else {
		window.location.href = targetUrl;
	}
}

onMount(() => {
	checkCurrentLang();

	const handleContentReplace = () => {
		checkCurrentLang();
	};

	const win = window as WindowWithSwup;
	if (win.swup?.hooks) {
		win.swup.hooks.on("content:replace", handleContentReplace);
	} else {
		document.addEventListener("swup:enable", () => {
			const w = window as WindowWithSwup;
			if (w.swup?.hooks) {
				w.swup.hooks.on("content:replace", handleContentReplace);
			}
		});
	}

	window.addEventListener("popstate", checkCurrentLang);

	const handleLangChange = (e: Event) => {
		const customEvent = e as CustomEvent<{ isEn?: boolean }>;
		if (customEvent.detail?.isEn !== undefined) {
			isEn = customEvent.detail.isEn;
		}
	};
	window.addEventListener("lang-change", handleLangChange);

	return () => {
		window.removeEventListener("popstate", checkCurrentLang);
		window.removeEventListener("lang-change", handleLangChange);
	};
});
</script>

<div class="z-50" title={!canSwitch ? "English version not available for this page" : undefined}>
	<button
		type="button"
		id="language-switch"
		disabled={!canSwitch}
		aria-disabled={!canSwitch ? "true" : undefined}
		aria-label={!canSwitch ? "English version not available for this page" : (isEn ? "切换为中文" : "Switch to English")}
		title={!canSwitch ? "English version not available for this page" : (isEn ? "切换为中文" : "Switch to English")}
		class="btn-plain scale-animation rounded-lg h-11 px-2.5 flex items-center justify-center gap-1 active:scale-90 font-medium text-xs select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none {siteConfig.navbar.followTheme ? 'text-(--primary)' : 'text-black/75 dark:text-white/75 hover:text-(--primary) dark:hover:text-(--primary)'}"
		onclick={toggleLanguage}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-current" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path d="m12.87 15.07-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7 1.62-4.33L19.12 17h-3.24z"/>
		</svg>
		<span class="font-bold tracking-wide text-current">{isEn ? "中" : "EN"}</span>
	</button>
</div>
