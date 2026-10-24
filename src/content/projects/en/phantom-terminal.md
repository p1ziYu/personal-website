---
title: THE PHANTOM TERMINAL
published: 2026-10-24
image: ../../../assets/images/projects/phantom-terminal-cover.webp
description: "No shell, no filesystem — every keystroke feeds into a 360M parameter neural network predicting terminal screen diffs. Exploring WorldTUI: Qwen2.5-Coder-0.5B fine-tuned into a 208 MB in-browser world model, the 333-token vocabulary, the COPY scroll trick, and the quiet tragedy of layer-7 memory loss."
tags: [Astro, WorldTUI, World Model, Terminal, Qwen, WebGPU, Interactive]
status: published
lang: en
link:
  - label: Launch Phantom Terminal Playground
    icon: material-symbols:open-in-new
    value: /en/projects/phantom-terminal/
---

THE PHANTOM TERMINAL — Inspired by the vibrant Hacker News discussion on 21 October 2026 (~621 points, ~186 comments) around simedw's essay: "WorldTUI: I trained a 360M model to pretend to be a terminal."

The premise is striking: **there is NO shell and NO filesystem behind the curtain**. Every keystroke (as raw terminal bytes) feeds directly into a compact neural network. Rather than appending tokens to an endless text stream, the model predicts **screen diffs across the two-dimensional terminal character grid alongside cursor positioning**.

### Core Architecture & Engineering Highlights

1. **Training Regimen & Docker Sessions**:
   - WorldTUI is fine-tuned from Qwen2.5-Coder-0.5B on real program runs recorded inside Docker containers.
   - The dataset spans 336k episodes totaling roughly 2B tokens.
   - Usernames, hostnames, shell prompts, directories, and personas were thoroughly randomized, alongside an artificial 1.2% typing typo rate.
   - 35% of all sessions were started partway through (mid-vim, mid-snake, mid-tmux), training the model to seamlessly pick up execution from any arbitrary screen state.
   - Total training budget: approximately 75 GPU-hours on a single RTX 4090.

2. **The Screen is the State & The COPY Trick**:
   - A terminal is a 2D character matrix, not a streaming typewriter. Traditional LLM streaming cannot express `clear` (cursor leaping back to row 0) or arbitrary vim cursor jumps.
   - Redrawing an entire 80x24 screen line by line upon scrolling costs ~3,000 tokens for a single Enter press.
   - Instead, `ROW_n COPY m` copies row m from the preceding screen to row n in the current screen: just 3 tokens per line.
   - The entire vocabulary is whittled down to a razor-sharp **333 tokens** (256 raw byte tokens + 64 row tokens + a handful of special control operators). Grammar-constrained decoding enforces that every generated token sequence constitutes a strictly valid screen update.

3. **DAgger-Style Self-Repair**:
   - Compounding errors are the death of world models: one hallucinatory filename permanently poisons the subsequent trajectory.
   - Solution: freeze a recorded session, let the model predict the next 1–4 events, compare the output with the ground-truth screen, and construct an on-the-fly correction to repair the display on the following keypress.
   - The iron rule: corrections may **only utilize tokens appearing on an earlier real screen or in the user's immediate typing** — never model-invented words, preventing hallucination reinforcement. Three self-repair passes lifted PresetBench performance from 24/47 to 38/47 (int4).

4. **Parallel Row Generation & Speculative Verification**:
   - Because most screen rows do not interdepend, batch generation yields updates across all rows concurrently, with a final cursor prediction pass seeing all rows. Large-frame p95 latency on an RTX 4090 plunged from 6.7s to 0.87s.
   - A sequential verifier guards against coordination hazards (e.g. vim opening across row 3 or multiple snake foods spawning), retaining the draft until the first disagreement.
   - Running in-browser on an M4 Mac: routine typing latency is ~60 ms per keystroke, while a massive redraw like `man test` takes ~0.9s with parallel drafting.

5. **Pruning from 494M to 208 MB**:
   - Base Qwen2.5-Coder-0.5B comprises ~494M parameters, with 136M allocated strictly to the 151,936-token embedding table.
   - Stripping unused embeddings down to 333 tokens cuts the model to ~360M parameters (shrinking 990 MB to 716 MB).
   - int4 quantization compresses the browser artifact to 208 MB, executing locally in a tab via a custom JavaScript Qwen decoder and WGSL compute shaders on WebGPU.

### Honest Limitations & The Layer-7 Memory Collapse

- **Far From a Reliable Filesystem**: Running `echo green >> colors` followed immediately by `cat colors` frequently omits the newly appended line. Unfamiliar command pipelines unravel quickly.
- **The Bitter Lesson of Distillation**: Severing layer 7 without retraining leaves next-token prediction accuracy virtually untouched (dipping from 99.3% to 98.9%, seemingly immaculate), yet causes exact memory readbacks across 64 test cases to collapse from 64/64 straight to 0/64. **A student model can look completely fine while having quietly lost its memory.**

---
> *This article was generated by AI.*
