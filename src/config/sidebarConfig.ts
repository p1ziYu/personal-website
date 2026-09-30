import type { SidebarLayoutConfig } from "../types/sidebarConfig";

// 侧栏显示资料、分类、标签和站点统计，文章页继续让正文占满宽度。
export const sidebarLayoutConfig: SidebarLayoutConfig = {
	enable: true,
	position: "both",
	hideSidebarOnPostPage: false,
	leftComponents: [
		{
			type: "profile",
			enable: true,
			position: "top",
			showOnPostPage: true,
		},
		{
			type: "music",
			enable: true,
			position: "top",
			showOnPostPage: true,
		},
		{
			type: "categories",
			enable: true,
			position: "top",
			showOnPostPage: false,
		},
		{
			type: "tags",
			enable: true,
			position: "top",
			showOnPostPage: false,
			specificConfig: { collapseThreshold: 12 },
		},
	],
	rightComponents: [
		{
			type: "stats",
			enable: true,
			position: "top",
			showOnPostPage: false,
		},
		{
			type: "siteInfo",
			enable: true,
			position: "top",
			showOnPostPage: true,
		},
		{
			type: "calendar",
			enable: true,
			position: "top",
			showOnPostPage: false,
		},
		{
			type: "sidebarToc",
			enable: true,
			position: "top",
			showOnPostPage: true,
			hideOnNonPostPage: true,
		},
	],
	mobileBottomComponents: [
		{
			type: "music",
			enable: true,
			showOnPostPage: false,
		},
		{
			type: "categories",
			enable: true,
			showOnPostPage: false,
		},
		{
			type: "tags",
			enable: true,
			showOnPostPage: false,
		},
	],
};
