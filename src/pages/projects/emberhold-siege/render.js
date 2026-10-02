import {
	TILE,
	WIDTH,
	HEIGHT,
	ROUTES,
	ROADS,
	BLOCKED,
	TOWERS,
	ENEMIES,
} from "./data.js";

const noise = (n) => {
	const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return v - Math.floor(v);
};
export class Renderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.background = document.createElement("canvas");
		this.background.width = WIDTH * 2;
		this.background.height = HEIGHT * 2;
		const ctx = this.background.getContext("2d");
		ctx.scale(2, 2);
		this.map(ctx);
		this.resize = () => {
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = WIDTH * ratio;
			canvas.height = HEIGHT * ratio;
			this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		};
		this.resize();
	}
	polygon(ctx, x, y, radius, sides, rotation = 0) {
		ctx.beginPath();
		for (let i = 0; i < sides; i++) {
			const angle = rotation + (i * Math.PI * 2) / sides;
			const px = x + Math.cos(angle) * radius;
			const py = y + Math.sin(angle) * radius;
			if (i === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.closePath();
	}
	map(ctx) {
		ctx.fillStyle = "#172623";
		ctx.fillRect(0, 0, WIDTH, HEIGHT);
		for (let y = 0; y < 12; y++)
			for (let x = 0; x < 16; x++) {
				const seed = y * 16 + x;
				ctx.fillStyle = `rgba(104,139,112,${0.015 + noise(seed) * 0.045})`;
				ctx.fillRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
				ctx.strokeStyle = "#a5b89409";
				ctx.lineWidth = 0.6;
				ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
				if (ROADS.has(`${x},${y}`)) continue;
				for (let k = 0; k < 5; k++) {
					const gx = x * TILE + noise(seed * 17 + k) * 40 + 4;
					const gy = y * TILE + noise(seed * 23 + k) * 40 + 4;
					ctx.strokeStyle = k % 2 ? "#58725340" : "#8a967329";
					ctx.beginPath();
					ctx.moveTo(gx - 2, gy);
					ctx.lineTo(gx, gy - 5);
					ctx.lineTo(gx + 2, gy);
					ctx.stroke();
				}
			}
		// Layered road borders make the paths legible without flattening the terrain.
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		for (const [width, color] of [
			[39, "#0b1717"],
			[35, "#4b4a3b"],
			[31, "#3b3c31"],
			[23, "#424135"],
		]) {
			ctx.lineWidth = width;
			ctx.strokeStyle = color;
			for (const route of ROUTES) {
				ctx.beginPath();
				route.forEach((p, i) =>
					i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
				);
				ctx.stroke();
			}
		}
		for (const key of ROADS) {
			const [x, y] = key.split(",").map(Number);
			for (let k = 0; k < 4; k++) {
				ctx.fillStyle = k % 2 ? "#ada28118" : "#191f1b40";
				ctx.fillRect(
					x * TILE + 12 + noise(x * 71 + y * 18 + k) * 23,
					y * TILE + 12 + noise(y * 31 + x * 12 + k) * 23,
					3,
					2,
				);
			}
		}
		for (const key of BLOCKED) {
			const [x, y] = key.split(",").map(Number);
			if (x === 15 && y === 6) continue;
			for (let i = 0; i < 3; i++) {
				const rx = x * TILE + 10 + i * 12;
				const ry = y * TILE + 20 + (i % 2) * 12;
				ctx.fillStyle = "#101c1c";
				this.polygon(ctx, rx + 2, ry + 4, 15 - i * 2, 5, i);
				ctx.fill();
				ctx.fillStyle = "#45504a";
				this.polygon(ctx, rx, ry, 13 - i * 2, 5, i);
				ctx.fill();
				ctx.strokeStyle = "#6d786447";
				ctx.stroke();
			}
		}
		// Quiet cartographic details.
		ctx.font = "10px sans-serif";
		ctx.fillStyle = "#b8b89b65";
		ctx.textAlign = "left";
		ctx.fillText("北境 · 焦土隘口", 28, 44);
		ctx.fillText("南境 · 失落林地", 35, 543);
		ctx.textAlign = "right";
		ctx.fillText("余烬要塞", 735, 465);
		ctx.strokeStyle = "#a5b89450";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(710, 500);
		ctx.lineTo(710, 532);
		ctx.moveTo(698, 516);
		ctx.lineTo(722, 516);
		ctx.stroke();
		this.polygon(ctx, 710, 506, 7, 3, -Math.PI / 2);
		ctx.fillStyle = "#a5b89480";
		ctx.fill();
		ctx.textAlign = "center";
		ctx.fillText("北", 710, 490);
	}
	draw(game, time) {
		const c = this.ctx;
		c.clearRect(0, 0, WIDTH, HEIGHT);
		c.save();
		if (game.shake > 0 && !game.paused)
			c.translate(
				(Math.random() - 0.5) * 9 * game.shake,
				(Math.random() - 0.5) * 9 * game.shake,
			);
		c.drawImage(this.background, 0, 0, WIDTH, HEIGHT);
		for (let i = 0; i < 24; i++) {
			const x =
				(noise(i + 83) * WIDTH + Math.sin(time * 0.3 + i) * 18 + WIDTH) % WIDTH;
			const y =
				(noise(i + 103) * HEIGHT -
					((time * (4 + noise(i) * 8)) % HEIGHT) +
					HEIGHT) %
				HEIGHT;
			c.globalAlpha = 0.18 + (Math.sin(time + i) + 1) * 0.15;
			c.fillStyle = "#e6a45d";
			c.fillRect(x, y, 1.7, 1.7);
		}
		c.globalAlpha = 1;
		ROUTES.forEach((route, i) => {
			const p = route[0];
			c.save();
			c.translate(p.x, p.y);
			c.strokeStyle = "#db785c";
			c.lineWidth = 1.5;
			this.polygon(c, 0, 0, 17 + Math.sin(time * 2) * 1.5, 6, Math.PI / 6);
			c.stroke();
			c.fillStyle = "#201d1a";
			this.polygon(c, 0, 0, 13, 6, Math.PI / 6);
			c.fill();
			c.fillStyle = "#eeb190";
			c.font = "bold 11px sans-serif";
			c.textAlign = "center";
			c.fillText(["壹", "贰", "叁"][i], 0, 4);
			c.restore();
		});
		this.base(c, game, time);
		const selection = game.selected;
		const selectedTower = selection && game.towerAt(selection.x, selection.y);
		const ghost =
			selection && !selectedTower ? selection : !selectedTower && game.hover;
		if (selection && game.active) {
			const type = selectedTower?.type || game.buildType;
			const spec = TOWERS[type];
			const x = selection.x * TILE + 24;
			const y = selection.y * TILE + 24;
			const radius = spec.range[(selectedTower?.level || 1) - 1];
			if (radius) {
				c.fillStyle = `${spec.color}0c`;
				c.strokeStyle = `${spec.color}80`;
				c.lineWidth = 1;
				c.setLineDash([5, 5]);
				c.beginPath();
				c.arc(x, y, radius, 0, Math.PI * 2);
				c.fill();
				c.stroke();
				c.setLineDash([]);
			}
			c.strokeStyle = spec.color;
			c.lineWidth = 1.5;
			c.strokeRect(x - 22, y - 22, 44, 44);
		}
		if (
			ghost &&
			game.active &&
			game.valid(ghost.x, ghost.y) &&
			!game.towerAt(ghost.x, ghost.y)
		) {
			c.globalAlpha = 0.38;
			this.tower(
				c,
				{
					x: ghost.x * TILE + 24,
					y: ghost.y * TILE + 24,
					type: game.buildType,
					level: 1,
					angle: -Math.PI / 2,
					flash: 0,
				},
				time,
			);
			c.globalAlpha = 1;
		}
		for (const t of game.towers) this.tower(c, t, time);
		for (const e of game.enemies) this.enemy(c, e, time);
		for (const p of game.projectiles) {
			c.strokeStyle = p.color;
			c.fillStyle = p.color;
			if (p.beam) {
				c.globalAlpha = Math.min(1, p.life / 0.16);
				c.lineWidth = 2;
				c.beginPath();
				c.moveTo(p.x, p.y);
				c.lineTo(p.tx, p.ty);
				c.stroke();
				c.globalAlpha = 1;
			} else if (p.splash) {
				c.shadowBlur = 10;
				c.shadowColor = p.color;
				c.beginPath();
				c.arc(p.x, p.y, 4, 0, Math.PI * 2);
				c.fill();
				c.shadowBlur = 0;
			} else {
				const angle = Math.atan2(p.ty - p.y, p.tx - p.x);
				c.lineWidth = 2;
				c.beginPath();
				c.moveTo(p.x, p.y);
				c.lineTo(p.x - Math.cos(angle) * 12, p.y - Math.sin(angle) * 12);
				c.stroke();
			}
		}
		for (const ring of game.rings) {
			c.globalAlpha = (ring.life / ring.maxLife) * 0.6;
			c.strokeStyle = ring.color;
			c.lineWidth = 2;
			c.beginPath();
			c.arc(
				ring.x,
				ring.y,
				ring.radius * (1 - (ring.life / ring.maxLife) * 0.8),
				0,
				Math.PI * 2,
			);
			c.stroke();
		}
		for (const p of game.particles) {
			c.globalAlpha = Math.min(1, p.life * 2);
			c.fillStyle = p.color;
			c.fillRect(p.x, p.y, p.size, p.size);
		}
		c.font = "bold 11px sans-serif";
		c.textAlign = "center";
		for (const n of game.numbers) {
			c.globalAlpha = Math.min(1, n.life * 3);
			c.fillStyle = "#101c1c";
			c.fillText(n.text, n.x + 1, n.y + 1);
			c.fillStyle = n.color;
			c.fillText(n.text, n.x, n.y);
		}
		c.globalAlpha = 1;
		c.restore();
	}
	base(c, game, time) {
		const x = 696;
		const y = 312;
		const glow = c.createRadialGradient(x, y, 5, x, y, 66);
		glow.addColorStop(0, "#e9ad493d");
		glow.addColorStop(1, "#e9ad4900");
		c.fillStyle = glow;
		c.fillRect(x - 70, y - 70, 140, 140);
		c.fillStyle = "#0c191a";
		this.polygon(c, x, y + 7, 35, 6, Math.PI / 6);
		c.fill();
		c.fillStyle = "#5b6052";
		c.strokeStyle = "#9e9a72";
		c.lineWidth = 2;
		this.polygon(c, x, y, 32, 6, Math.PI / 6);
		c.fill();
		c.stroke();
		c.fillStyle = "#273632";
		this.polygon(c, x, y, 24, 6, Math.PI / 6);
		c.fill();
		c.strokeStyle = "#cbb276";
		c.lineWidth = 2;
		for (let i = 0; i < 4; i++) {
			const angle = Math.PI / 4 + (i * Math.PI) / 2;
			const bx = x + Math.cos(angle) * 29;
			const by = y + Math.sin(angle) * 29;
			c.fillStyle = "#666853";
			c.fillRect(bx - 5, by - 7, 10, 14);
			c.strokeRect(bx - 5, by - 7, 10, 14);
		}
		c.shadowColor = "#ffba54";
		c.shadowBlur = 15 + Math.sin(time * 3) * 4;
		c.fillStyle = "#ffd680";
		this.polygon(c, x, y - 3, 14, 4, 0);
		c.fill();
		c.shadowBlur = 0;
		c.fillStyle = "#fff0ba";
		this.polygon(c, x, y - 4, 7, 4, 0);
		c.fill();
		c.fillStyle = "#101e1d";
		c.fillRect(x - 27, y + 43, 54, 5);
		c.fillStyle = game.lives > 8 ? "#adbe8a" : "#ed8266";
		c.fillRect(x - 27, y + 43, (54 * game.lives) / 20, 5);
		c.fillStyle = "#d4c5a3";
		c.font = "10px sans-serif";
		c.textAlign = "center";
		c.fillText("余烬核心", x, y + 64);
	}
	tower(c, t, time) {
		const color = TOWERS[t.type].color;
		c.save();
		c.translate(t.x, t.y);
		c.fillStyle = "#08171699";
		c.beginPath();
		c.ellipse(2, 9, 20, 12, 0, 0, Math.PI * 2);
		c.fill();
		c.fillStyle = "#343e39";
		c.strokeStyle = "#7c8270";
		c.lineWidth = 1.5;
		this.polygon(c, 0, 3, 18 + t.level, 6, Math.PI / 6);
		c.fill();
		c.stroke();
		c.fillStyle = "#1b2d2a";
		this.polygon(c, 0, 0, 15 + t.level, 6, Math.PI / 6);
		c.fill();
		if (t.level >= 2) {
			c.strokeStyle = color;
			c.globalAlpha *= 0.6;
			this.polygon(c, 0, 0, 15 + t.level, 6, Math.PI / 6);
			c.stroke();
			c.globalAlpha /= 0.6;
		}
		if (t.type === "arrow") {
			c.rotate(t.angle);
			c.fillStyle = "#8c7954";
			c.fillRect(-10, -5, 20, 10);
			c.strokeStyle = color;
			c.lineWidth = 3;
			c.beginPath();
			c.moveTo(8, -13);
			c.lineTo(2, 0);
			c.lineTo(8, 13);
			c.stroke();
			c.lineWidth = 1;
			c.beginPath();
			c.moveTo(8, -13);
			c.lineTo(-6, 0);
			c.lineTo(8, 13);
			c.stroke();
			c.fillStyle = "#ece0b4";
			c.fillRect(-3, -1.5, 24, 3);
			if (t.level === 3) {
				c.fillRect(0, -7, 17, 2);
				c.fillRect(0, 5, 17, 2);
			}
		} else if (t.type === "cannon") {
			c.rotate(t.angle);
			c.fillStyle = "#74584a";
			c.beginPath();
			c.arc(0, 0, 11, 0, Math.PI * 2);
			c.fill();
			c.fillStyle = "#b68b6b";
			c.fillRect(-5, -7, 26 + t.level * 2, 14);
			c.fillStyle = "#38403a";
			c.fillRect(16 + t.level * 2, -5, 4, 10);
			c.fillStyle = color;
			c.fillRect(3, -7, 3, 14);
			if (t.level === 3) c.fillRect(10, -7, 3, 14);
		} else if (t.type === "sniper") {
			c.rotate(t.angle);
			c.fillStyle = "#716980";
			c.fillRect(-10, -7, 21, 14);
			c.fillStyle = "#c4b5d4";
			c.fillRect(4, -3, 27 + t.level * 3, 6);
			c.fillStyle = color;
			c.fillRect(0, -10, 11, 4);
			if (t.level === 3) {
				c.fillStyle = "#746686";
				c.fillRect(12, -6, 13, 12);
			}
		} else if (t.type === "frost") {
			c.rotate(time * 0.3);
			c.strokeStyle = color;
			c.lineWidth = 2;
			for (let i = 0; i < 6; i++) {
				c.rotate(Math.PI / 3);
				c.beginPath();
				c.moveTo(0, 0);
				c.lineTo(0, -14 - t.level);
				c.moveTo(-4, -9);
				c.lineTo(0, -5);
				c.lineTo(4, -9);
				c.stroke();
			}
			c.fillStyle = "#d3f8f5";
			this.polygon(c, 0, 0, 6 + t.level, 4);
			c.fill();
		} else {
			c.fillStyle = "#876f40";
			c.fillRect(-11, -7, 22, 20);
			c.fillStyle = "#d4af60";
			this.polygon(c, 0, -8, 16, 3, -Math.PI / 2);
			c.fill();
			c.fillStyle = "#253330";
			c.fillRect(-5, 1, 10, 12);
			c.fillStyle = color;
			this.polygon(c, 0, -5, 5, 4);
			c.fill();
			for (let i = 0; i < t.level; i++) {
				c.fillStyle = "#ecd18b";
				c.fillRect(-13 + i * 10, 12, 6, 3);
			}
		}
		if (t.flash > 0 && t.type !== "frost" && t.type !== "mint") {
			c.fillStyle = "#fff0b0";
			this.polygon(c, t.type === "sniper" ? 37 : 25, 0, 8, 4);
			c.fill();
		}
		c.restore();
		c.fillStyle = color;
		for (let i = 0; i < t.level; i++) {
			this.polygon(c, t.x + (i - (t.level - 1) / 2) * 7, t.y + 24, 2, 4);
			c.fill();
		}
	}
	enemy(c, e, time) {
		const spec = ENEMIES[e.type];
		const radius = spec.radius;
		const bob = Math.sin(time * 9 + e.phase) * (e.type === "boss" ? 1 : 2);
		c.save();
		c.translate(e.x, e.y);
		c.fillStyle = "#07121099";
		c.beginPath();
		c.ellipse(1, radius * 0.7, radius, radius * 0.48, 0, 0, Math.PI * 2);
		c.fill();
		c.translate(0, bob);
		let color = e.slow > 0 ? "#83cddd" : spec.color;
		if (e.flash > 0) color = "#fff4d7";
		c.fillStyle = color;
		c.strokeStyle = "#222724";
		c.lineWidth = 2;
		if (e.type === "swarm") {
			for (let i = -1; i <= 1; i++) {
				c.strokeStyle = color;
				c.beginPath();
				c.moveTo(-9, i * 4);
				c.lineTo(9, -i * 4);
				c.stroke();
			}
			c.beginPath();
			c.ellipse(0, 0, 5, 7, 0, 0, Math.PI * 2);
			c.fill();
		} else if (e.type === "runner") {
			this.polygon(c, 0, 0, 10, 3, Math.PI / 2);
			c.fill();
			c.stroke();
			c.strokeStyle = color;
			c.beginPath();
			c.moveTo(-5, 7);
			c.lineTo(-9, 11 + bob);
			c.moveTo(5, 7);
			c.lineTo(9, 11 - bob);
			c.stroke();
		} else if (e.type === "boss") {
			this.polygon(c, 0, 0, radius, 6, Math.PI / 6);
			c.fill();
			c.stroke();
			c.fillStyle = "#602f2b";
			this.polygon(c, 0, 0, 16, 5, -Math.PI / 2);
			c.fill();
			c.fillStyle = "#eec382";
			c.beginPath();
			c.moveTo(-18, -9);
			c.lineTo(-24, -27);
			c.lineTo(-8, -18);
			c.lineTo(0, -30);
			c.lineTo(8, -18);
			c.lineTo(24, -27);
			c.lineTo(18, -9);
			c.fill();
			c.fillStyle = "#ffb665";
			this.polygon(c, 0, 5, 8, 4);
			c.fill();
		} else {
			this.polygon(
				c,
				0,
				0,
				radius,
				e.type === "tank" ? 4 : 6,
				e.type === "tank" ? Math.PI / 4 : Math.PI / 6,
			);
			c.fill();
			c.stroke();
			c.fillStyle = "#313c35";
			c.fillRect(-radius + 1, 5, 5, 7 + bob);
			c.fillRect(radius - 6, 5, 5, 7 - bob);
			if (e.type === "healer") {
				c.fillStyle = "#d9edc6";
				c.fillRect(-2, -7, 4, 14);
				c.fillRect(-7, -2, 14, 4);
			}
		}
		if (e.type !== "healer") {
			c.fillStyle = "#fff0b3";
			c.fillRect(-5, -5, 3, 3);
			c.fillRect(3, -5, 3, 3);
		}
		if (e.shield > 0) {
			c.strokeStyle = "#92cff1b0";
			c.lineWidth = 2;
			this.polygon(c, 0, 0, radius + 5, 6, Math.PI / 6);
			c.stroke();
		}
		if (e.slow > 0) {
			c.strokeStyle = "#abe6f380";
			c.lineWidth = 1;
			c.beginPath();
			c.arc(0, 0, radius + 4, 0, Math.PI * 2);
			c.stroke();
		}
		c.restore();
		if (e.hp < e.maxHp || e.type === "boss") {
			const width = e.type === "boss" ? 60 : 24;
			c.fillStyle = "#101b19";
			c.fillRect(e.x - width / 2 - 1, e.y - radius - 13, width + 2, 6);
			c.fillStyle = e.type === "boss" ? "#ed8b62" : "#b9be87";
			c.fillRect(
				e.x - width / 2,
				e.y - radius - 12,
				width * Math.max(0, e.hp / e.maxHp),
				4,
			);
			if (e.type === "boss") {
				c.fillStyle = "#f0c49c";
				c.font = "10px sans-serif";
				c.textAlign = "center";
				c.fillText("余烬领主", e.x, e.y - radius - 18);
			}
		}
	}
}
