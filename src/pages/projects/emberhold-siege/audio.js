// Procedural audio only. No samples, requests, or background autoplay.
export class Sound {
	constructor() {
		this.context = null;
		this.muted = false;
		this.last = {};
	}
	unlock() {
		try {
			this.context ||= new (window.AudioContext || window.webkitAudioContext)();
			if (this.context.state === "suspended")
				this.context.resume().catch(() => {});
		} catch {
			/* Audio is optional when the browser denies it. */
		}
	}
	tone(
		frequency,
		duration,
		type = "sine",
		volume = 0.06,
		delay = 0,
		end = frequency,
	) {
		if (this.muted || !this.context || this.context.state !== "running") return;
		const time = this.context.currentTime + delay;
		const oscillator = this.context.createOscillator();
		const gain = this.context.createGain();
		oscillator.type = type;
		oscillator.frequency.setValueAtTime(frequency, time);
		oscillator.frequency.exponentialRampToValueAtTime(
			Math.max(20, end),
			time + duration,
		);
		gain.gain.setValueAtTime(0.001, time);
		gain.gain.exponentialRampToValueAtTime(volume, time + 0.008);
		gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
		oscillator.connect(gain);
		gain.connect(this.context.destination);
		oscillator.start(time);
		oscillator.stop(time + duration + 0.02);
		oscillator.onended = () => {
			oscillator.disconnect();
			gain.disconnect();
		};
	}
	play(name) {
		const now = performance.now();
		if (now - (this.last[name] || 0) < 65) return;
		this.last[name] = now;
		if (name === "arrow") this.tone(820, 0.07, "triangle", 0.028, 0, 260);
		if (name === "cannon" || name === "explosion")
			this.tone(100, 0.23, "sawtooth", 0.045, 0, 24);
		if (name === "sniper") this.tone(1100, 0.2, "sawtooth", 0.025, 0, 65);
		if (name === "frost") {
			this.tone(660, 0.25, "sine", 0.025);
			this.tone(990, 0.23, "sine", 0.02, 0.06);
		}
		if (name === "coin" || name === "build") {
			this.tone(880, 0.12);
			this.tone(1320, 0.17, "sine", 0.04, 0.08);
		}
		if (name === "leak") {
			this.tone(160, 0.35, "square", 0.035, 0, 55);
		}
		if (name === "wave")
			[196, 247, 294].forEach((f, i) =>
				this.tone(f, 0.5, "triangle", 0.06, i * 0.13),
			);
		if (name === "victory")
			[262, 330, 392, 523, 659, 784].forEach((f, i) =>
				this.tone(f, 0.45, "triangle", 0.07, i * 0.15),
			);
		if (name === "defeat")
			[294, 247, 196, 147].forEach((f, i) =>
				this.tone(f, 0.6, "triangle", 0.06, i * 0.23),
			);
	}
}
