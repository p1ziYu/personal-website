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
	const isEn = () =>
		document.documentElement.lang === "en" ||
		location.pathname.startsWith("/en") ||
		document.documentElement.getAttribute("data-lang") === "en";

	function translateNotice(msg) {
		if (!isEn() || !msg) return msg;
		if (msg.includes("点击空地，建立你的第一座防御塔"))
			return "Tap open ground to build your first defensive tower.";
		if (msg.includes("道路与遗迹无法建造，请选择草地"))
			return "Roads and ruins cannot be built on. Please select grass.";
		if (msg.includes("金币不足，击败敌人或等待金矿产出"))
			return "Insufficient gold. Defeat enemies or wait for gold mines.";
		if (msg.includes("已部署。点击另一块草地继续建造"))
			return msg.replace(/已部署。点击另一块草地继续建造。/, " deployed. Tap another plot to build.");
		if (msg.includes("升级至") && msg.includes("级"))
			return msg.replace(/(.*)升级至 (\d+) 级。/, "$1 upgraded to Tier $2.");
		if (msg.includes("回收") && msg.includes("金币"))
			return msg.replace(/回收 (\d+) 金币（总投入的 70%）。/, "Recycled +$1 Gold (70% of investment).");
		if (msg.includes("第 ") && msg.includes(" 波"))
			return msg.replace(/第 (\d+) 波 · (.*)/, "Wave $1 · $2");
		if (msg.includes("防守成功！获得") && msg.includes("金币补给"))
			return msg.replace(/防守成功！获得 (\d+) 金币补给。/, "Defense successful! Earned +$1 Gold bounty.");
		if (msg.startsWith("成就 · "))
			return msg.replace(/^成就 · /, "Achievement Unlocked · ");
		return msg;
	}

	const labels = {
		arrow: isEn() ? "Rapid · Single Target" : "快速 · 单体",
		cannon: isEn() ? "Heavy · Splash AoE" : "重火力 · 范围",
		frost: isEn() ? "Control · Frost Nova" : "控制 · 冰环",
		sniper: isEn() ? "Piercing · Long Range" : "穿甲 · 远程",
		mint: isEn() ? "Economy · Gold Flow" : "经济 · 收益",
	};
	const towerButtons = {};
	for (const [type, spec] of Object.entries(TOWERS)) {
		const name = isEn() ? (spec.name_en || spec.name) : spec.name;
		const button = document.createElement("button");
		button.type = "button";
		button.dataset.tower = type;
		button.setAttribute(
			"aria-label",
			isEn() ? `${name}, ${spec.cost} Gold` : `${name}，${spec.cost} 金币`,
		);
		button.innerHTML = `<span class="tower-icon" style="color:${spec.color}">${spec.icon}</span><span class="tower-name">${name}</span><span class="tower-price">${spec.cost}</span>`;
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
		$("score").textContent = game.score.toLocaleString(isEn() ? "en-US" : "zh-CN");
		$("best-score").textContent = game.best.score.toLocaleString(isEn() ? "en-US" : "zh-CN");
		$("best-wave").textContent = game.best.wave;
		$("notice").textContent = translateNotice(game.notice);
		$("pause").innerHTML = game.paused
			? (isEn() ? "▶ <span>Resume</span>" : "▶ <span>继续</span>")
			: (isEn() ? "Ⅱ <span>Pause</span>" : "Ⅱ <span>暂停</span>");
		$("pause").setAttribute(
			"aria-label",
			game.paused
				? (isEn() ? "Resume game" : "继续游戏")
				: (isEn() ? "Pause game" : "暂停游戏"),
		);
		$("pause").disabled = !game.active;
		$("speed").textContent = `${game.speed}×`;
		$("mute").innerHTML = game.sound.muted
			? (isEn() ? "♪ <span>Muted</span>" : "♪ <span>音效关</span>")
			: (isEn() ? "♪ <span>Sound On</span>" : "♪ <span>音效开</span>");
		$("mute").setAttribute("aria-pressed", String(game.sound.muted));
		$("pause-overlay").hidden = !game.paused || !game.active;
		const waveIndex = Math.min(
			14,
			game.phase === "battle" || game.phase === "defeat"
				? game.wave - 1
				: game.wave,
		);
		const wave = WAVES[waveIndex];
		$("next-index").textContent =
			`${String(waveIndex + 1).padStart(2, "0")} / 15`;
		$("wave-name").textContent = isEn() ? (wave.name_en || wave.name) : wave.name;
		$("modifier").textContent = isEn() ? (wave.modifier_en || wave.modifier) : wave.modifier;
		const composition = Object.entries(wave.composition)
			.map(
				([type, count]) =>
					`<span>${isEn() ? (ENEMIES[type].name_en || ENEMIES[type].name) : ENEMIES[type].name}<b>×${count}</b></span>`,
			)
			.join("");
		if ($("composition").innerHTML !== composition)
			$("composition").innerHTML = composition;
		$("wave-bonus").textContent = isEn() ? `Bonus +${wave.bonus}` : `奖励 +${wave.bonus}`;
		$("send-wave").disabled = game.phase !== "build" || game.paused;
		$("send-wave").innerHTML =
			game.phase === "battle"
				? (isEn() ? "Wave in Progress <span>≋</span>" : "敌军进攻中 <span>≋</span>")
				: (isEn() ? "Start Next Wave <span>→</span>" : "开始下一波 <span>→</span>");
		const tower =
			game.selected && game.towerAt(game.selected.x, game.selected.y);
		const type = tower?.type || game.buildType;
		const spec = TOWERS[type];
		const name = isEn() ? (spec.name_en || spec.name) : spec.name;
		const index = (tower?.level || 1) - 1;
		for (const [key, button] of Object.entries(towerButtons)) {
			button.classList.toggle("selected", key === type);
			button.setAttribute("aria-pressed", String(key === type));
		}
		$("selection-name").textContent = name;
		$("selection-level").textContent = tower
			? isEn()
				? `Tier ${tower.level} / 3 · ${tower.type === "mint" ? `Yield ${tower.income}` : `Kills ${tower.kills}`}`
				: `等级 ${tower.level} / 3 · ${tower.type === "mint" ? `产出 ${tower.income}` : `击破 ${tower.kills}`}`
			: labels[type];
		$("tower-description").textContent = isEn() ? (spec.description_en || spec.description) : spec.description;
		$("tower-stats").innerHTML =
			type === "mint"
				? isEn()
					? `<span>Yield<b>${spec.income[index]} Gold</b></span><span>Interval<b>${spec.interval[index]}s</b></span><span>Active<b>Combat</b></span>`
					: `<span>周期产出<b>${spec.income[index]} 金币</b></span><span>产出间隔<b>${spec.interval[index]} 秒</b></span><span>生效时段<b>战斗中</b></span>`
				: isEn()
					? `<span>Damage<b>${spec.damage[index]}</b></span><span>Range<b>${(spec.range[index] / 48).toFixed(1)} Tiles</b></span><span>Rate<b>${spec.interval[index]}s</b></span>`
					: `<span>伤害<b>${spec.damage[index]}</b></span><span>射程<b>${(spec.range[index] / 48).toFixed(1)} 格</b></span><span>攻击间隔<b>${spec.interval[index]} 秒</b></span>`;
		$("build-tower").hidden = Boolean(tower);
		$("tower-actions").hidden = !tower;
		$("build-tower").disabled =
			!game.selected || !game.active || game.paused || game.gold < spec.cost;
		$("build-tower").textContent = !game.selected
			? (isEn() ? "Click map to select build spot" : "点击地图选择建造位置")
			: game.gold < spec.cost
				? (isEn() ? `Insufficient Gold · Need ${spec.cost}` : `金币不足 · 需要 ${spec.cost}`)
				: (isEn() ? `Build ${name} · ${spec.cost} Gold` : `建造${spec.name} · ${spec.cost} 金币`);
		if (tower) {
			const cost = spec.upgrades[index];
			$("upgrade").textContent =
				tower.level === 3
					? (isEn() ? "Max Tier Reached" : "已达最高等级")
					: (isEn() ? `Upgrade · ${cost} Gold` : `升级 · ${cost} 金币`);
			$("upgrade").disabled =
				tower.level === 3 || game.gold < cost || game.paused || !game.active;
			$("sell").textContent = isEn() ? `Sell +${Math.floor(tower.invested * 0.7)}` : `出售 +${Math.floor(tower.invested * 0.7)}`;
			$("sell").disabled = game.paused || !game.active;
			$("tip").textContent =
				tower.level < 3
					? type === "mint"
						? (isEn() ? `Next tier yields ${spec.income[index + 1]} gold every ${spec.interval[index + 1]}s.` : `下级每 ${spec.interval[index + 1]} 秒产出 ${spec.income[index + 1]} 金币。`)
						: (isEn() ? `Next tier: damage ${spec.damage[index + 1]}, range ${(spec.range[index + 1] / 48).toFixed(1)} tiles, rate ${spec.interval[index + 1]}s.` : `下级伤害 ${spec.damage[index + 1]}，射程 ${(spec.range[index + 1] / 48).toFixed(1)} 格，攻击间隔 ${spec.interval[index + 1]} 秒。`)
					: (isEn() ? "Fully fortified Tier 3 bastion. Place firepower and control at trail intersections." : "三级防御塔已完全强化。将火力与控制布置在道路交汇处。");
		} else
			$("tip").textContent = isEn() ? "Deploy Cannons and Frost Spires at intersections to halt dense swarms." : "交汇处部署炮塔与寒冰塔，让密集敌军寸步难行。";
		$("achievements").textContent = isEn()
			? `Achievements: ${[...game.achievements].join(", ") || "None unlocked"}`
			: `本局成就：${[...game.achievements].join("、") || "尚未解锁"}`;
		if (displayedPhase !== game.phase) {
			displayedPhase = game.phase;
			const finished = game.phase === "victory" || game.phase === "defeat";
			$("overlay").hidden = game.active;
			$("instructions").hidden = finished;
			$("result-stats").hidden = !finished;
			if (finished) {
				$("overlay-title").innerHTML =
					game.phase === "victory"
						? (isEn() ? "The Long Night Passes<br /><span>The Embers Burn Bright.</span>" : "长夜已尽<br /><span>余烬长明。</span>")
						: (isEn() ? "The Beacon Fades<br /><span>The Watch Continues.</span>" : "烽火虽熄<br /><span>守望不止。</span>");
				$("overlay-description").textContent =
					game.phase === "victory"
						? (isEn() ? "All 15 waves repelled. The sanctuary welcomes a new dawn." : "十五波攻势已击退。要塞迎来了新的黎明。")
						: (isEn() ? `Defenses fell at wave ${game.wave}. Rebuild your bastions and hold the night again.` : `防线在第 ${game.wave} 波失守。重整工事，再守一次长夜。`);
				$("result-stats").textContent = isEn()
					? `Score ${game.score.toLocaleString("en-US")} · Defended ${game.cleared} Waves · Kills ${game.kills} · Health ${game.lives}`
					: `得分 ${game.score.toLocaleString("zh-CN")} · 守住 ${game.cleared} 波 · 击破 ${game.kills} · 耐久 ${game.lives}`;
				$("begin").innerHTML = isEn() ? "Defend Again <span>→</span>" : "再守一次 <span>→</span>";
				$("overlay-foot").textContent = game.saveSucceeded
					? (isEn() ? "Best record saved to this device" : "最佳纪录已保存在此设备")
					: (isEn() ? "Best record could not be saved to this device" : "最佳纪录未能保存至此设备，仅在本次游戏中保留");
			} else if (game.phase === "intro") {
				$("overlay-title").innerHTML = isEn() ? "The Long Night Approaches<br /><span>The Embers Endure.</span>" : "长夜将至<br /><span>余烬不灭。</span>";
				$("overlay-description").innerHTML = isEn()
					? "The horde closes through the mist. Rally your defense<br />and keep the sanctuary's last flame burning."
					: "敌军正从雾中逼近。筑起防线，<br />让这座要塞的最后一束火光继续燃烧。";
				$("begin").innerHTML = isEn() ? "Ignite the Beacon <span>→</span>" : "点燃烽火 <span>→</span>";
				$("overlay-foot").textContent = isEn() ? "Initial 300 Gold · 20 Core Health · Zero Downloads" : "初始 300 金币 · 20 点耐久 · 无需联网";
			}
		}
		tickUI();
	}
	function tickUI() {
		if (game.phase === "build") {
			$("phase-label").textContent = isEn()
				? `Prep Phase · ${Math.ceil(game.countdown)}s`
				: `准备阶段 · ${Math.ceil(game.countdown)} 秒`;
			$("wave-status").textContent = isEn()
				? `Auto-starts in ${Math.ceil(game.countdown)}s`
				: `${Math.ceil(game.countdown)} 秒后自动进攻`;
			$("wave-progress-fill").style.width =
				`${Math.max(0, game.countdown / (game.wave ? 16 : 18)) * 100}%`;
		} else if (game.phase === "battle") {
			$("phase-label").textContent =
				game.wave % 5 === 0
					? (isEn() ? "Lord Approaches · Full Alert" : "领主来袭 · 全线警戒")
					: (isEn() ? "Engaged · Hold the Line" : "交战中 · 坚守防线");
			const total = Object.values(WAVES[game.wave - 1].composition).reduce(
				(a, b) => a + b,
				0,
			);
			const remaining = game.queue.length + game.enemies.length;
			$("wave-status").textContent = isEn() ? `Remaining Enemies ${remaining} / ${total}` : `剩余敌军 ${remaining} / ${total}`;
			$("wave-progress-fill").style.width = `${(1 - remaining / total) * 100}%`;
		} else {
			$("phase-label").textContent =
				game.phase === "intro"
					? (isEn() ? "Awaiting Orders" : "等待指挥")
					: game.phase === "victory"
						? (isEn() ? "Victory" : "防守胜利")
						: (isEn() ? "Defeat" : "防线失守");
			$("wave-status").textContent =
				game.phase === "intro"
					? (isEn() ? "Deploy your first defensive line" : "部署你的第一道防线")
					: (isEn() ? `Fully Defended ${game.cleared} Waves` : `完整守住 ${game.cleared} 波`);
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
