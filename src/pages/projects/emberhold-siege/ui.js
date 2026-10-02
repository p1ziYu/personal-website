import { Game } from "./engine.js";
import { Renderer } from "./render.js";
import { TOWERS, WAVES, ENEMIES } from "./data.js";

export function mount() {
	const $ = (id) => document.getElementById(id);
	const canvas = $("battle-canvas");
	if (!canvas || canvas.dataset.mounted) return;
	canvas.dataset.mounted = "true";
	const renderer = new Renderer(canvas);
	let game;
	let displayedPhase = "";
	let lastRender = 0;
	let restartWasPaused = false;
	const labels = {
		arrow: "快速 · 单体",
		cannon: "重火力 · 范围",
		frost: "控制 · 冰环",
		sniper: "穿甲 · 远程",
		mint: "经济 · 收益",
	};
	const towerButtons = {};
	for (const [type, spec] of Object.entries(TOWERS)) {
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.tower = type;
		button.setAttribute("aria-label", `${spec.name}，${spec.cost} 金币`);
		button.innerHTML = `<span class="tower-icon" style="color:${spec.color}">${spec.icon}</span><span class="tower-name">${spec.name}</span><span class="tower-price">${spec.cost}</span>`;
		button.addEventListener("click", () => {
			game.buildType = type;
			if (game.selected && game.towerAt(game.selected.x, game.selected.y))
				game.selected = null;
			sync();
		});
		$("tower-palette").append(button);
		towerButtons[type] = button;
	}
	function sync() {
		if (!game) return;
		$("gold").textContent = game.gold;
		$("lives").textContent = game.lives;
		$("wave").textContent = String(game.wave).padStart(2, "0");
		$("kills").textContent = game.kills;
		$("score").textContent = game.score.toLocaleString("zh-CN");
		$("best-score").textContent = game.best.score.toLocaleString("zh-CN");
		$("best-wave").textContent = game.best.wave;
		$("notice").textContent = game.notice;
		$("pause").innerHTML = game.paused
			? "▶ <span>继续</span>"
			: "Ⅱ <span>暂停</span>";
		$("pause").setAttribute(
			"aria-label",
			game.paused ? "继续游戏" : "暂停游戏",
		);
		$("pause").disabled = !game.active;
		$("speed").textContent = `${game.speed}×`;
		$("mute").innerHTML = game.sound.muted
			? "♪ <span>音效关</span>"
			: "♪ <span>音效开</span>";
		$("mute").setAttribute("aria-pressed", String(game.sound.muted));
		$("pause-overlay").hidden = !game.paused || !game.active;
		const waveIndex = Math.min(
			14,
			game.phase === "battle" ? game.wave - 1 : game.wave,
		);
		const wave = WAVES[waveIndex];
		$("next-index").textContent =
			`${String(waveIndex + 1).padStart(2, "0")} / 15`;
		$("wave-name").textContent = wave.name;
		$("modifier").textContent = wave.modifier;
		const composition = Object.entries(wave.composition)
			.map(
				([type, count]) => `<span>${ENEMIES[type].name}<b>×${count}</b></span>`,
			)
			.join("");
		if ($("composition").innerHTML !== composition)
			$("composition").innerHTML = composition;
		$("wave-bonus").textContent = `奖励 +${wave.bonus}`;
		$("send-wave").disabled = game.phase !== "build" || game.paused;
		$("send-wave").innerHTML =
			game.phase === "battle"
				? "敌军进攻中 <span>≋</span>"
				: "开始下一波 <span>→</span>";
		const tower =
			game.selected && game.towerAt(game.selected.x, game.selected.y);
		const type = tower?.type || game.buildType;
		const spec = TOWERS[type];
		const index = (tower?.level || 1) - 1;
		for (const [key, button] of Object.entries(towerButtons)) {
			button.classList.toggle("selected", key === type);
			button.setAttribute("aria-pressed", String(key === type));
		}
		$("selection-name").textContent = spec.name;
		$("selection-level").textContent = tower
			? `等级 ${tower.level} / 3 · ${tower.type === "mint" ? `产出 ${tower.income}` : `击破 ${tower.kills}`}`
			: labels[type];
		$("tower-description").textContent = spec.description;
		$("tower-stats").innerHTML =
			type === "mint"
				? `<span>周期产出<b>${spec.income[index]} 金币</b></span><span>产出间隔<b>${spec.interval[index]} 秒</b></span><span>生效时段<b>战斗中</b></span>`
				: `<span>伤害<b>${spec.damage[index]}</b></span><span>射程<b>${(spec.range[index] / 48).toFixed(1)} 格</b></span><span>攻击间隔<b>${spec.interval[index]} 秒</b></span>`;
		$("build-tower").hidden = Boolean(tower);
		$("tower-actions").hidden = !tower;
		$("build-tower").disabled =
			!game.selected || !game.active || game.paused || game.gold < spec.cost;
		$("build-tower").textContent = !game.selected
			? "点击地图选择建造位置"
			: game.gold < spec.cost
				? `金币不足 · 需要 ${spec.cost}`
				: `建造${spec.name} · ${spec.cost} 金币`;
		if (tower) {
			const cost = spec.upgrades[index];
			$("upgrade").textContent =
				tower.level === 3 ? "已达最高等级" : `升级 · ${cost} 金币`;
			$("upgrade").disabled =
				tower.level === 3 || game.gold < cost || game.paused || !game.active;
			$("sell").textContent = `出售 +${Math.floor(tower.invested * 0.7)}`;
			$("sell").disabled = game.paused || !game.active;
			$("tip").textContent =
				tower.level < 3
					? type === "mint"
						? `下级每 ${spec.interval[index + 1]} 秒产出 ${spec.income[index + 1]} 金币。`
						: `下级伤害 ${spec.damage[index + 1]}，射程 ${(spec.range[index + 1] / 48).toFixed(1)} 格，攻击间隔 ${spec.interval[index + 1]} 秒。`
					: "三级防御塔已完全强化。将火力与控制布置在道路交汇处。";
		} else
			$("tip").textContent = "交汇处部署炮塔与寒冰塔，让密集敌军寸步难行。";
		$("achievements").textContent =
			`本局成就：${[...game.achievements].join("、") || "尚未解锁"}`;
		if (displayedPhase !== game.phase) {
			displayedPhase = game.phase;
			const finished = game.phase === "victory" || game.phase === "defeat";
			$("overlay").hidden = game.active;
			$("instructions").hidden = finished;
			$("result-stats").hidden = !finished;
			if (finished) {
				$("overlay-title").innerHTML =
					game.phase === "victory"
						? "长夜已尽<br /><span>余烬长明。</span>"
						: "烽火虽熄<br /><span>守望不止。</span>";
				$("overlay-description").textContent =
					game.phase === "victory"
						? "十五波攻势已击退。要塞迎来了新的黎明。"
						: `防线在第 ${game.wave} 波失守。重整工事，再守一次长夜。`;
				$("result-stats").textContent =
					`得分 ${game.score.toLocaleString("zh-CN")} · 守住 ${game.cleared} 波 · 击破 ${game.kills} · 耐久 ${game.lives}`;
				$("begin").innerHTML = "再守一次 <span>→</span>";
				$("overlay-foot").textContent = "最佳纪录已保存在此设备";
			} else if (game.phase === "intro") {
				$("overlay-title").innerHTML = "长夜将至<br /><span>余烬不灭。</span>";
				$("overlay-description").innerHTML =
					"敌军正从雾中逼近。筑起防线，<br />让这座要塞的最后一束火光继续燃烧。";
				$("begin").innerHTML = "点燃烽火 <span>→</span>";
				$("overlay-foot").textContent = "初始 300 金币 · 20 点耐久 · 无需联网";
			}
		}
		tickUI();
	}
	function tickUI() {
		if (game.phase === "build") {
			$("phase-label").textContent =
				`准备阶段 · ${Math.ceil(game.countdown)} 秒`;
			$("wave-status").textContent =
				`${Math.ceil(game.countdown)} 秒后自动进攻`;
			$("wave-progress-fill").style.width =
				`${Math.max(0, game.countdown / (game.wave ? 16 : 18)) * 100}%`;
		} else if (game.phase === "battle") {
			$("phase-label").textContent =
				game.wave % 5 === 0 ? "领主来袭 · 全线警戒" : "交战中 · 坚守防线";
			const total = Object.values(WAVES[game.wave - 1].composition).reduce(
				(a, b) => a + b,
				0,
			);
			const remaining = game.queue.length + game.enemies.length;
			$("wave-status").textContent = `剩余敌军 ${remaining} / ${total}`;
			$("wave-progress-fill").style.width = `${(1 - remaining / total) * 100}%`;
		} else {
			$("phase-label").textContent =
				game.phase === "intro"
					? "等待指挥"
					: game.phase === "victory"
						? "防守胜利"
						: "防线失守";
			$("wave-status").textContent =
				game.phase === "intro"
					? "部署你的第一道防线"
					: `完整守住 ${game.cleared} 波`;
		}
	}
	game = new Game(sync);
	sync();
	$("begin").addEventListener("click", () => {
		if (game.phase !== "intro") game.reset();
		game.start();
	});
	$("build-tower").addEventListener("click", () => game.build());
	$("upgrade").addEventListener("click", () => game.upgrade());
	$("sell").addEventListener("click", () => game.sell());
	$("send-wave").addEventListener("click", () => game.nextWave());
	function pause() {
		if (game.active) {
			game.paused = !game.paused;
			game.sound.unlock();
			sync();
		}
	}
	$("pause").addEventListener("click", pause);
	$("resume").addEventListener("click", pause);
	$("speed").addEventListener("click", () => {
		game.speed = (game.speed % 3) + 1;
		sync();
	});
	$("mute").addEventListener("click", () => {
		game.sound.muted = !game.sound.muted;
		if (!game.sound.muted) game.sound.unlock();
		sync();
	});
	$("restart").addEventListener("click", () => {
		restartWasPaused = game.paused;
		if (game.active) game.paused = true;
		sync();
		$("restart-dialog").showModal();
	});
	const cancelRestart = () => {
		$("restart-dialog").close();
		game.paused = restartWasPaused;
		sync();
	};
	$("cancel-restart").addEventListener("click", cancelRestart);
	$("restart-dialog").addEventListener("cancel", (event) => {
		event.preventDefault();
		cancelRestart();
	});
	$("confirm-restart").addEventListener("click", () => {
		$("restart-dialog").close();
		game.reset();
		game.start();
	});
	$("help").addEventListener("click", () => {
		$("manual").open = !$("manual").open;
		if ($("manual").open) {
			if (game.active && !game.paused) pause();
			$("manual").scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	});
	function coordinates(event) {
		const rect = canvas.getBoundingClientRect();
		return {
			x: Math.floor(((event.clientX - rect.left) / rect.width) * 16),
			y: Math.floor(((event.clientY - rect.top) / rect.height) * 12),
		};
	}
	canvas.addEventListener("pointermove", (event) => {
		game.hover = coordinates(event);
	});
	canvas.addEventListener("pointerleave", () => {
		game.hover = null;
	});
	canvas.addEventListener("click", (event) => {
		game.sound.unlock();
		const { x, y } = coordinates(event);
		game.select(x, y);
		if (game.selected && window.innerWidth <= 460)
			document
				.querySelector(".arsenal")
				.scrollIntoView({ behavior: "smooth", block: "nearest" });
	});
	canvas.addEventListener("keydown", (event) => {
		const moves = {
			ArrowLeft: [-1, 0],
			ArrowRight: [1, 0],
			ArrowUp: [0, -1],
			ArrowDown: [0, 1],
		};
		if (moves[event.key]) {
			event.preventDefault();
			const old = game.hover || game.selected || { x: 5, y: 6 };
			const [dx, dy] = moves[event.key];
			game.hover = {
				x: Math.max(0, Math.min(15, old.x + dx)),
				y: Math.max(0, Math.min(11, old.y + dy)),
			};
		}
		if (event.key === "Enter" && game.hover) {
			event.preventDefault();
			game.select(game.hover.x, game.hover.y);
		}
	});
	document.addEventListener("keydown", (event) => {
		if (
			$("restart-dialog").open ||
			event.target instanceof HTMLButtonElement ||
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLAnchorElement
		)
			return;
		if (event.code === "Space") {
			event.preventDefault();
			pause();
		}
		if (event.key === "Escape") {
			game.selected = null;
			sync();
		}
		if (/^[1-5]$/.test(event.key))
			towerButtons[Object.keys(TOWERS)[Number(event.key) - 1]].click();
	});
	document.addEventListener("visibilitychange", () => {
		if (document.hidden && game.active && !game.paused) {
			game.paused = true;
			sync();
		}
	});
	let previous = performance.now();
	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	function frame(now) {
		const dt = Math.min((now - previous) / 1000, 0.05);
		previous = now;
		// Small fixed substeps prevent fast enemies and projectiles skipping at 3×.
		const steps = Math.ceil(dt / 0.016) || 1;
		for (let i = 0; i < steps; i++) game.update(dt / steps);
		renderer.draw(
			game,
			reducedMotion || game.paused ? game.elapsed : now / 1000,
		);
		if (now - lastRender > 100) {
			tickUI();
			lastRender = now;
		}
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}
