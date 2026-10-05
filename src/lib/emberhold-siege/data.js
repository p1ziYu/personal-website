// Balance values use logical map pixels and simulation seconds.
export const TILE = 48;
export const WIDTH = 768;
export const HEIGHT = 576;
export const TOWERS = {
	arrow: {
		name: "箭塔",
		name_en: "Arrow Tower",
		icon: "➶",
		color: "#d5c48b",
		cost: 65,
		damage: [15, 27, 46],
		range: [137, 150, 165],
		interval: [0.64, 0.53, 0.43],
		upgrades: [80, 135],
		description: "迅捷连射，优先攻击最接近核心的敌人。",
		description_en: "Rapid volleys, prioritizing enemies closest to the core.",
	},
	cannon: {
		name: "炮塔",
		name_en: "Cannon",
		icon: "◉",
		color: "#f19a66",
		cost: 110,
		damage: [40, 72, 120],
		range: [148, 160, 175],
		interval: [1.9, 1.7, 1.5],
		upgrades: [125, 190],
		description: "爆炸波及周围敌人，克制虫群与密集队列。",
		description_en: "Area-of-effect blasts that decimate swarms and dense lines.",
	},
	frost: {
		name: "寒冰塔",
		name_en: "Frost Spire",
		icon: "❄",
		color: "#80d7eb",
		cost: 95,
		damage: [5, 9, 15],
		range: [113, 129, 145],
		interval: [1.15, 1, 0.85],
		upgrades: [110, 170],
		description: "冰环同时击中范围内敌军，减速 40% / 48% / 56%。",
		description_en: "Radial frost pulses slowing all nearby enemies by 40% / 48% / 56%.",
	},
	sniper: {
		name: "狙击塔",
		name_en: "Sniper Tower",
		icon: "⌖",
		color: "#c4a2f3",
		cost: 155,
		damage: [110, 190, 320],
		range: [275, 310, 355],
		interval: [3.3, 3, 2.7],
		upgrades: [175, 260],
		description: "超远距离精准穿甲，护盾伤害额外提高 50%。",
		description_en: "Extreme-range piercing rounds dealing +50% bonus damage to shields.",
	},
	mint: {
		name: "金矿塔",
		name_en: "Gold Mine",
		icon: "◇",
		color: "#ecc15e",
		cost: 100,
		damage: [0, 0, 0],
		range: [0, 0, 0],
		interval: [7, 6.5, 6],
		income: [14, 23, 36],
		upgrades: [120, 180],
		description: "战斗中定时产出金币。尽早投资，积累后期优势。",
		description_en: "Produces gold periodically in combat. Invest early to build an advantage.",
	},
};
export const ENEMIES = {
	grunt: {
		name: "灰烬兵",
		name_en: "Ashen Grunt",
		hp: 55,
		speed: 39,
		gold: 9,
		color: "#cf8066",
		radius: 10,
	},
	runner: {
		name: "疾行兽",
		name_en: "Sprinter Beast",
		hp: 39,
		speed: 72,
		gold: 10,
		color: "#eebf76",
		radius: 8,
	},
	tank: {
		name: "重甲卫",
		name_en: "Armored Juggernaut",
		hp: 185,
		speed: 26,
		gold: 20,
		color: "#ac9aa1",
		radius: 14,
	},
	swarm: {
		name: "蚀火虫",
		name_en: "Blight Crawler",
		hp: 25,
		speed: 53,
		gold: 5,
		color: "#dca362",
		radius: 6,
	},
	healer: {
		name: "祈火者",
		name_en: "Pyre Cleric",
		hp: 105,
		speed: 34,
		gold: 19,
		color: "#92c4a1",
		radius: 11,
	},
	shield: {
		name: "盾焰卫",
		name_en: "Flame Sentinel",
		hp: 120,
		speed: 37,
		gold: 18,
		color: "#89acc8",
		radius: 12,
		shield: 75,
	},
	boss: {
		name: "余烬领主",
		name_en: "Ember Lord",
		hp: 1700,
		speed: 22,
		gold: 150,
		color: "#ef7353",
		radius: 23,
	},
};
// All three routes share their last stretch; road cells are never buildable.
const points = [
	[
		[0, 2],
		[4, 2],
		[4, 5],
		[7, 5],
		[7, 3],
		[11, 3],
		[11, 6],
		[14, 6],
	],
	[
		[0, 9],
		[3, 9],
		[3, 7],
		[7, 7],
		[7, 9],
		[11, 9],
		[11, 6],
		[14, 6],
	],
	[
		[8, 0],
		[8, 1],
		[13, 1],
		[13, 4],
		[11, 4],
		[11, 6],
		[14, 6],
	],
];
export const ROUTES = points.map((route) => {
	const cells = [];
	for (let i = 0; i < route.length - 1; i++) {
		let [x, y] = route[i];
		const [tx, ty] = route[i + 1];
		while (x !== tx || y !== ty) {
			cells.push({ x: x * TILE + 24, y: y * TILE + 24 });
			x += Math.sign(tx - x);
			y += Math.sign(ty - y);
		}
	}
	const last = route.at(-1);
	cells.push({ x: last[0] * TILE + 24, y: last[1] * TILE + 24 });
	return cells;
});
export const ROADS = new Set(
	ROUTES.flat().map(
		(p) => `${Math.floor(p.x / TILE)},${Math.floor(p.y / TILE)}`,
	),
);
export const BLOCKED = new Set([
	"0,0",
	"1,0",
	"15,0",
	"15,1",
	"0,11",
	"1,11",
	"14,11",
	"15,11",
	"15,6",
]);
const formations = [
	{ grunt: 10 },
	{ grunt: 12, runner: 5 },
	{ grunt: 12, swarm: 14 },
	{ tank: 4, runner: 9, grunt: 10 },
	{ boss: 1, grunt: 14, runner: 8 },
	{ shield: 7, swarm: 20, grunt: 12 },
	{ healer: 4, tank: 7, runner: 12 },
	{ shield: 10, runner: 18, swarm: 18 },
	{ tank: 10, healer: 5, grunt: 20 },
	{ boss: 1, shield: 12, swarm: 24, healer: 4 },
	{ runner: 26, tank: 10, shield: 12 },
	{ swarm: 48, healer: 6, shield: 14 },
	{ tank: 16, healer: 8, runner: 24 },
	{ shield: 24, tank: 14, swarm: 36 },
	{ boss: 1, tank: 14, shield: 20, healer: 8, runner: 24 },
];
const names = [
	"雾中来客",
	"急行之影",
	"虫潮初现",
	"铁甲推进",
	"第一位领主",
	"蓝焰护盾",
	"逆火祈祷",
	"三线突袭",
	"钢铁洪流",
	"熔炉暴君",
	"疾风围城",
	"无尽虫鸣",
	"不灭军团",
	"最后的长夜",
	"余烬之王",
];
const names_en = [
	"Mist Walkers",
	"Fleet Shadows",
	"The Swarm Stirs",
	"Iron March",
	"The First Lord",
	"Azure Barrier",
	"Pyre Invocation",
	"Three-Pronged Blitz",
	"Steel Torrent",
	"Forge Tyrant",
	"Gale Siege",
	"Chitin Symphony",
	"The Undying Legion",
	"The Final Night",
	"Lord of Embers",
];
export const WAVES = formations.map((composition, i) => ({
	name: names[i],
	name_en: names_en[i],
	composition,
	hp: 1 + i * 0.145,
	speed: 1 + i * 0.018,
	gap: Math.max(0.28, 0.95 - i * 0.042),
	bonus: 40 + i * 9,
	modifier:
		i === 7
			? "急袭：移动速度额外提高 15%"
			: i === 11
				? "虫潮：敌军间隔缩短 25%"
				: i === 13
					? "铁壁：护盾强度提高 35%"
					: i % 5 === 4
						? "领主来袭：漏防损失 5 点核心耐久"
						: "守住三条进攻路线",
	modifier_en:
		i === 7
			? "Blitz: Movement speed +15%"
			: i === 11
				? "Swarm: Spawn interval reduced by 25%"
				: i === 13
					? "Bulwark: Shield capacity +35%"
					: i % 5 === 4
						? "Lord Approaches: Leaking costs 5 Core Health"
						: "Hold the three invasion routes",
}));
export function waveQueue(index) {
	const counts = { ...WAVES[index].composition };
	const queue = [];
	// Interleave classes instead of sending all healers at the end.
	while (Object.values(counts).some((n) => n > 0)) {
		for (const type of Object.keys(counts)) {
			if (counts[type] > 0 && type !== "boss") {
				queue.push(type);
				counts[type]--;
			}
		}
		if (counts.boss && queue.length > 8) {
			queue.push("boss");
			counts.boss--;
		}
	}
	return queue;
}
