import {
	TOWERS,
	ENEMIES,
	WAVES,
	ROUTES,
	ROADS,
	BLOCKED,
	TILE,
	waveQueue,
} from "./data.js";
import { Sound } from "./audio.js";

export class Game {
	constructor(onChange) {
		this.sound = new Sound();
		this.onChange = onChange;
		this.best = { score: 0, wave: 0 };
		try {
			const saved = JSON.parse(
				localStorage.getItem("emberhold-record") || "{}",
			);
			this.best = {
				score: Number.isFinite(saved?.score) ? Math.max(0, saved.score) : 0,
				wave:
					Number.isInteger(saved?.wave) && saved.wave > 0
						? Math.min(WAVES.length, saved.wave)
						: 0,
			};
		} catch {
			/* Private browsing and corrupt records cannot stop a game. */
		}
		this.reset();
	}
	reset() {
		Object.assign(this, {
			gold: 300,
			lives: 20,
			wave: 0,
			cleared: 0,
			kills: 0,
			earned: 0,
			phase: "intro",
			paused: false,
			speed: 1,
			countdown: 18,
			elapsed: 0,
			towers: [],
			enemies: [],
			projectiles: [],
			particles: [],
			numbers: [],
			rings: [],
			queue: [],
			spawnClock: 0,
			spawnIndex: 0,
			selected: null,
			hover: null,
			buildType: "arrow",
			shake: 0,
			achievements: new Set(),
			saveSucceeded: false,
			noticeQueue: [],
			noticeTime: 0,
			notice: "点击空地，建立你的第一座防御塔。",
		});
		this.changed();
	}
	changed() {
		this.onChange?.(this);
	}
	get notice() {
		return this._notice;
	}
	set notice(message) {
		if (this.noticeTime > 0) this.noticeQueue.push(message);
		else {
			this._notice = message;
			this.noticeTime = 3;
		}
	}
	start() {
		this.sound.unlock();
		this.phase = "build";
		this.changed();
	}
	get score() {
		return this.cleared * 1000 + this.kills * 10 + this.lives * 50;
	}
	get active() {
		return this.phase === "build" || this.phase === "battle";
	}
	valid(x, y) {
		return (
			x >= 0 &&
			x < 16 &&
			y >= 0 &&
			y < 12 &&
			!ROADS.has(`${x},${y}`) &&
			!BLOCKED.has(`${x},${y}`)
		);
	}
	towerAt(x, y) {
		return this.towers.find((t) => t.col === x && t.row === y);
	}
	select(x, y) {
		if (!this.active) return;
		if (!this.valid(x, y)) {
			this.notice = "道路与遗迹无法建造，请选择草地。";
			this.changed();
			return;
		}
		this.selected = { x, y };
		this.notice = this.towerAt(x, y)
			? "升级火力，或出售防御塔重新部署。"
			: "选定地块：选择塔型，再确认建造。";
		this.changed();
	}
	build() {
		if (!this.active || this.paused || !this.selected) return;
		const { x, y } = this.selected;
		const spec = TOWERS[this.buildType];
		if (!this.valid(x, y) || this.towerAt(x, y)) return;
		if (this.gold < spec.cost) {
			this.notice = "金币不足，击败敌人或等待金矿产出。";
			this.changed();
			return;
		}
		this.gold -= spec.cost;
		const tower = {
			type: this.buildType,
			col: x,
			row: y,
			x: x * TILE + 24,
			y: y * TILE + 24,
			level: 1,
			invested: spec.cost,
			cooldown: 0.35,
			angle: -Math.PI / 2,
			flash: 0,
			kills: 0,
			income: 0,
		};
		this.towers.push(tower);
		this.burst(tower.x, tower.y, spec.color, 16);
		this.sound.play("build");
		this.notice = `${spec.name}已部署。点击另一块草地继续建造。`;
		if (new Set(this.towers.map((t) => t.type)).size === 5)
			this.achieve("五行防线", "同时部署五种防御塔");
		this.changed();
	}
	upgrade() {
		if (!this.active || this.paused || !this.selected) return;
		const t = this.towerAt(this.selected.x, this.selected.y);
		if (!t || t.level === 3) return;
		const cost = TOWERS[t.type].upgrades[t.level - 1];
		if (this.gold < cost) return;
		this.gold -= cost;
		t.invested += cost;
		t.level++;
		this.burst(t.x, t.y, TOWERS[t.type].color, 24);
		this.sound.play("build");
		this.notice = `${TOWERS[t.type].name}升级至 ${t.level} 级。`;
		if (t.level === 3) this.achieve("炉火纯青", "首次将防御塔升至三级");
		this.changed();
	}
	sell() {
		if (!this.active || this.paused || !this.selected) return;
		const t = this.towerAt(this.selected.x, this.selected.y);
		if (!t) return;
		const refund = Math.floor(t.invested * 0.7);
		this.gold += refund;
		this.towers.splice(this.towers.indexOf(t), 1);
		this.float(t.x, t.y, `+${refund}`, "#ecc15e");
		this.sound.play("coin");
		this.notice = `回收 ${refund} 金币（总投入的 70%）。`;
		this.changed();
	}
	nextWave() {
		if (this.phase !== "build" || this.paused) return;
		this.wave++;
		this.phase = "battle";
		this.queue = waveQueue(this.wave - 1);
		this.spawnClock = 0;
		this.spawnIndex = 0;
		this.notice = `第 ${this.wave} 波 · ${WAVES[this.wave - 1].name}`;
		this.sound.play("wave");
		this.changed();
	}
	spawn(type) {
		const spec = ENEMIES[type];
		const wave = WAVES[this.wave - 1];
		const route = ROUTES[this.spawnIndex++ % (this.wave < 3 ? 2 : 3)];
		const hp =
			spec.hp * wave.hp * (type === "boss" ? 1 + (this.wave - 5) * 0.06 : 1);
		this.enemies.push({
			type,
			x: route[0].x,
			y: route[0].y,
			route,
			point: 1,
			progress: 0,
			hp,
			maxHp: hp,
			shield: (spec.shield || 0) * wave.hp * (this.wave === 14 ? 1.35 : 1),
			speed: spec.speed * wave.speed * (this.wave === 8 ? 1.15 : 1),
			slow: 0,
			slowFactor: 1,
			flash: 0,
			healClock: 2.4,
			dead: false,
			phase: this.spawnIndex * 1.7,
		});
	}
	damage(enemy, amount, tower) {
		if (enemy.dead) return;
		if (enemy.shield > 0) {
			const multiplier = tower.type === "sniper" ? 1.5 : 1;
			const absorbed = Math.min(enemy.shield, amount * multiplier);
			enemy.shield -= absorbed;
			amount -= absorbed / multiplier;
		}
		enemy.hp -= amount;
		enemy.flash = 0.12;
		if (amount > 8)
			this.float(enemy.x, enemy.y - 14, `${Math.round(amount)}`, "#f3e8d1");
		if (enemy.hp <= 0) {
			enemy.dead = true;
			this.kills++;
			tower.kills++;
			const reward = ENEMIES[enemy.type].gold;
			this.gold += reward;
			this.earned += reward;
			this.burst(
				enemy.x,
				enemy.y,
				ENEMIES[enemy.type].color,
				enemy.type === "boss" ? 40 : 8,
			);
			if (enemy.type === "boss") {
				this.achieve("斩落领主", "击败一位余烬领主");
				this.sound.play("explosion");
			}
			if (this.kills >= 100) this.achieve("百战守望", "击败一百名敌军");
			this.changed();
		}
	}
	fire(tower, targets) {
		const spec = TOWERS[tower.type];
		const index = tower.level - 1;
		tower.cooldown = spec.interval[index];
		tower.flash = 0.16;
		this.sound.play(tower.type);
		if (tower.type === "frost") {
			this.rings.push({
				x: tower.x,
				y: tower.y,
				radius: spec.range[index],
				life: 0.45,
				maxLife: 0.45,
				color: spec.color,
			});
			for (const enemy of targets) {
				this.damage(enemy, spec.damage[index], tower);
				enemy.slowFactor = Math.min(
					enemy.slow > 0 ? enemy.slowFactor : 1,
					0.6 - index * 0.08,
				);
				enemy.slow = Math.max(enemy.slow, 1.8);
			}
			return;
		}
		const target = targets.sort(
			(a, b) =>
				a.route.length - a.point - (b.route.length - b.point) ||
				Math.hypot(a.route[a.point].x - a.x, a.route[a.point].y - a.y) -
					Math.hypot(b.route[b.point].x - b.x, b.route[b.point].y - b.y),
		)[0];
		tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x);
		if (tower.type === "sniper") {
			this.projectiles.push({
				x: tower.x,
				y: tower.y,
				tx: target.x,
				ty: target.y,
				life: 0.16,
				beam: true,
				color: spec.color,
			});
			this.damage(target, spec.damage[index], tower);
		} else {
			this.projectiles.push({
				x: tower.x,
				y: tower.y,
				target,
				tx: target.x,
				ty: target.y,
				tower,
				damage: spec.damage[index],
				speed: tower.type === "cannon" ? 310 : 530,
				splash: tower.type === "cannon" ? 57 + index * 8 : 0,
				life: 3,
				color: spec.color,
			});
		}
	}
	update(dt) {
		if (!this.paused) {
			this.noticeTime = Math.max(0, this.noticeTime - dt);
			if (this.noticeTime === 0 && this.noticeQueue.length) {
				this.notice = this.noticeQueue.shift();
				this.changed();
			}
		}
		if (!this.active || this.paused) return;
		dt *= this.speed;
		this.elapsed += dt;
		this.shake = Math.max(0, this.shake - dt);
		for (const collection of [this.particles, this.numbers, this.rings]) {
			for (const p of collection) {
				p.life -= dt;
				if (p.vx !== undefined) {
					p.x += p.vx * dt;
					p.y += p.vy * dt;
					p.vy += 28 * dt;
				}
			}
			for (let i = collection.length - 1; i >= 0; i--)
				if (collection[i].life <= 0) collection.splice(i, 1);
		}
		if (this.phase === "build") {
			this.countdown -= dt;
			if (this.countdown <= 0) this.nextWave();
		}
		if (this.phase !== "battle") return;
		this.spawnClock -= dt;
		while (this.spawnClock <= 0 && this.queue.length) {
			this.spawn(this.queue.shift());
			this.spawnClock +=
				WAVES[this.wave - 1].gap * (this.wave === 12 ? 0.75 : 1);
		}
		for (const enemy of this.enemies) {
			if (enemy.dead) continue;
			enemy.flash = Math.max(0, enemy.flash - dt);
			enemy.slow = Math.max(0, enemy.slow - dt);
			if (enemy.type === "healer") {
				enemy.healClock -= dt;
				if (enemy.healClock <= 0) {
					enemy.healClock = 2.4;
					for (const friend of this.enemies)
						if (
							!friend.dead &&
							Math.hypot(friend.x - enemy.x, friend.y - enemy.y) < 88
						)
							friend.hp = Math.min(
								friend.maxHp,
								friend.hp + friend.maxHp * 0.045,
							);
					this.rings.push({
						x: enemy.x,
						y: enemy.y,
						radius: 88,
						life: 0.5,
						maxLife: 0.5,
						color: "#8ec9a3",
					});
				}
			}
			let distance = enemy.speed * (enemy.slow > 0 ? enemy.slowFactor : 1) * dt;
			while (distance > 0 && enemy.point < enemy.route.length) {
				const target = enemy.route[enemy.point];
				const dx = target.x - enemy.x;
				const dy = target.y - enemy.y;
				const length = Math.hypot(dx, dy);
				if (length <= distance) {
					enemy.x = target.x;
					enemy.y = target.y;
					enemy.point++;
					distance -= length;
				} else {
					enemy.x += (dx / length) * distance;
					enemy.y += (dy / length) * distance;
					distance = 0;
				}
			}
			if (enemy.point >= enemy.route.length) {
				enemy.dead = true;
				this.lives = Math.max(0, this.lives - (enemy.type === "boss" ? 5 : 1));
				this.shake = 0.45;
				this.burst(enemy.x, enemy.y, "#ff785c", 22);
				this.sound.play("leak");
				this.changed();
				if (!this.lives) {
					this.finish(false);
					return;
				}
			}
		}
		for (const tower of this.towers) {
			tower.cooldown -= dt;
			tower.flash = Math.max(0, tower.flash - dt);
			if (tower.cooldown > 0) continue;
			const spec = TOWERS[tower.type];
			const index = tower.level - 1;
			if (tower.type === "mint") {
				tower.cooldown = spec.interval[index];
				const income = spec.income[index];
				this.gold += income;
				tower.income += income;
				this.earned += income;
				this.float(tower.x, tower.y - 20, `+${income}`, "#ecc15e");
				this.sound.play("coin");
				this.changed();
			} else {
				const targets = this.enemies.filter(
					(e) =>
						!e.dead &&
						Math.hypot(e.x - tower.x, e.y - tower.y) <= spec.range[index],
				);
				if (targets.length) this.fire(tower, targets);
			}
		}
		for (const p of this.projectiles) {
			p.life -= dt;
			if (p.beam || p.life <= 0) continue;
			if (!p.target.dead) {
				p.tx = p.target.x;
				p.ty = p.target.y;
			}
			const distance = Math.hypot(p.tx - p.x, p.ty - p.y);
			if (distance <= p.speed * dt) {
				p.life = 0;
				if (p.splash) {
					this.burst(p.tx, p.ty, "#f3ad65", 16);
					this.sound.play("explosion");
					this.rings.push({
						x: p.tx,
						y: p.ty,
						radius: p.splash,
						life: 0.3,
						maxLife: 0.3,
						color: "#f19a66",
					});
					for (const enemy of this.enemies)
						if (
							!enemy.dead &&
							Math.hypot(enemy.x - p.tx, enemy.y - p.ty) < p.splash
						)
							this.damage(enemy, p.damage, p.tower);
				} else if (!p.target.dead) this.damage(p.target, p.damage, p.tower);
			} else {
				p.x += ((p.tx - p.x) / distance) * p.speed * dt;
				p.y += ((p.ty - p.y) / distance) * p.speed * dt;
			}
		}
		this.projectiles = this.projectiles.filter((p) => p.life > 0);
		this.enemies = this.enemies.filter((e) => !e.dead);
		if (!this.queue.length && !this.enemies.length) {
			this.cleared = this.wave;
			this.gold += WAVES[this.wave - 1].bonus;
			if (this.wave === 5 && this.lives === 20)
				this.achieve("滴水不漏", "满耐久守住前五波");
			this.save();
			if (this.wave === 15) this.finish(true);
			else {
				this.phase = "build";
				this.countdown = 16;
				this.notice = `防守成功！获得 ${WAVES[this.wave - 1].bonus} 金币补给。`;
				this.changed();
			}
		}
	}
	achieve(name, description) {
		if (this.achievements.has(name)) return;
		this.achievements.add(name);
		this.notice = `成就 · ${name}：${description}`;
	}
	save() {
		this.best.score = Math.max(this.best.score, this.score);
		this.best.wave = Math.max(this.best.wave, this.cleared);
		try {
			localStorage.setItem("emberhold-record", JSON.stringify(this.best));
			this.saveSucceeded = true;
		} catch {
			this.saveSucceeded = false;
		}
	}
	finish(win) {
		this.phase = win ? "victory" : "defeat";
		this.save();
		this.sound.play(this.phase);
		this.changed();
	}
	burst(x, y, color, count) {
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = 18 + Math.random() * 85;
			this.particles.push({
				x,
				y,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 0.3 + Math.random() * 0.5,
				color,
				size: 1 + Math.random() * 3,
			});
		}
		if (this.particles.length > 450)
			this.particles.splice(0, this.particles.length - 450);
	}
	float(x, y, text, color) {
		this.numbers.push({
			x: x + Math.random() * 12 - 6,
			y,
			vx: 0,
			vy: -28,
			text,
			color,
			life: 0.85,
		});
		if (this.numbers.length > 70) this.numbers.shift();
	}
}
