import type { SidebarLayoutConfig } from "../types/sidebarConfig";

// 侧栏显示资料、分类、标签和站点统计，文章页继续让正文占满宽度。
export const sidebarLayoutConfig: SidebarLayoutConfig = {
	enable: true,
	position: "left",
	hideSidebarOnPostPage: true,
	leftComponents: [
		{
			type: "profile",
			enable: true,
			position: "top",
			showOnPostPage: false,
		},
		{
			type: "ticket",
			enable: true,
			position: "top",
			showOnPostPage: false,
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
		{
			type: "stats",
			enable: true,
			position: "top",
			showOnPostPage: false,
		},
	],
	rightComponents: [],
	mobileBottomComponents: [
		{
			type: "ticket",
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
