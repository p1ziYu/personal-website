import type { ProfileConfig } from "../types/profileConfig";

export const profileConfig: ProfileConfig = {
	// 头像
	// 图片路径支持三种格式：
	// 1. public 目录（以 "/" 开头，不优化）："/assets/images/avatar.webp"
	// 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/avatar.webp"
	// 3. 远程 URL："https://example.com/avatar.jpg"
	avatar: "assets/images/NightVoyage/avatar.webp",

	// 名字
	name: "痞子宇",

	// 个人签名
	bio: "你所热爱的，就是你的生活。",

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			url: "https://github.com/p1ziYu",
			showName: false,
		},
		{
			name: "Bilibili",
			icon: "simple-icons:bilibili",
			url: "https://space.bilibili.com/347153863",
			showName: false,
		},
		{
			name: "小红书",
			icon: "simple-icons:xiaohongshu",
			url: "https://www.xiaohongshu.com/user/profile/652f6e13000000002a018ddd",
			showName: false,
		},
		{
			name: "LinkedIn",
			icon: "simple-icons:linkedin",
			url: "https://www.linkedin.com/in/zhengfan-ryan-yang",
			showName: false,
		},
		{
			name: "Steam",
			icon: "simple-icons:steam",
			url: "https://steamcommunity.com/id/p1ziYu/",
			showName: false,
		},
		{
			name: "QQ",
			icon: "simple-icons:qq",
			url: "https://qm.qq.com/q/LqbOKYQAua",
			showName: false,
		},
		{
			name: "Discord",
			icon: "simple-icons:discord",
			url: "https://discord.com/users/882814057315434546",
			showName: false,
		},
		{
			name: "RSS",
			icon: "fa7-solid:rss",
			url: "/rss/",
			showName: false,
		},
	],
};
