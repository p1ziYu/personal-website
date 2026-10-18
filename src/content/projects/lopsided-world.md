---
title: 歪行星 · LOPSIDED WORLD
published: 2026-10-18
image: ../../assets/images/projects/lopsided-world-cover.webp
description: "打破天文学常规假设：韦布空间望远镜首次为热木星 WASP-17 b 绘制出大气边缘空间分布图——这颗行星不是完美的正圆，晨昏两边缘温差约 650 K，傍晚大气向外膨胀足足 1.8 倍。"
tags: [Astro, 天体物理, 系外行星, 韦布望远镜, 詹姆斯·韦布, WASP-17b, 大气边缘, 科学可视化, 交互]
status: published
link:
  - label: 探索歪行星 WASP-17 b
    icon: material-symbols:open-in-new
    value: /projects/lopsided-world/
---

歪行星 · LOPSIDED WORLD — 探索 2026 年 10 月 14 日发表于《自然·天文学》（*Nature Astronomy*，DOI: 10.1038/s41550-026-02986-4，标题 "A Spatial Map of the Atmospheric Limb of a Hot Jupiter"）的天文里程碑发现：借助詹姆斯·韦布空间望远镜（JWST），天文学家首次绘制出系外行星大气边缘的精细空间分布图，证明热木星 WASP-17 b 并非完美圆形，而是晨昏严重不对称的“歪行星”。

每一颗你曾见过的行星插画几乎都是正圆——但这颗绝对不是。

### 核心发现与科研团队

WASP-17 b 是一颗距离地球约 1,300 光年的“热木星”（hot Jupiter），这是一颗极度靠近恒星公转、蓬松膨胀的巨型气态行星，完全没有固体表面。由于极度靠近主星，它已被恒星潮汐锁定：一侧永远朝向恒星（永恒昼半球），另一侧永远背对恒星（永恒夜半球）。

这项研究由美国康奈尔大学（Cornell University）与英国布里斯托大学（University of Bristol）联合领衔，第一作者为康奈尔大学克拉曼博士后研究员莉莉·奥尔德森（Lili Alderson，她在布里斯托大学攻读博士期间启动了这项工作）。该研究采用的新方法名为“透射弦法”（transmission strings），由布里斯托大学天体物理学家大卫·格兰特（David Grant）与汉娜·韦克福德（Hannah Wakeford）开发。

### 传统方法 vs 透射弦法

- **传统方法**：在行星凌星（transit）期间，传统天文分析将行星大气层简化为一个均匀圆环——仅拟合出一个单一边缘平均光谱（limb-averaged spectrum），把清晨边缘、傍晚边缘、赤道与两极全部混在一起，从而抹平了所有空间维度的真实变化。
- **透射弦新法**：当行星凌星进出恒星视圆面时，行星不同边缘切片遮挡恒星光芒的时序与贡献动态改变。研究团队利用开源天体建模软件 Harmonica 拟合这些动态变化的投影形状，成功从围绕边缘的不同角度解出独立光谱。团队将光谱划分为 24 个波长区间，精准测定围绕边缘不同位置的物理状态。该方法不仅能剖析晨昏边缘差异，还能进一步探索赤道与极区之间的温差。

### JWST 观测数据与物理机制

观测数据来自 JWST 的 TST DREAMS 巡天计划，联合启用了 NIRISS、NIRSpec 与 MIRI 三大科学仪器，完整覆盖 0.6 至 12 微米中红外至近红外超宽波段。

拟合与大气模型反演揭示出惊人的晨昏不对称性：
- **凉爽的清晨边缘（晨界 / 西侧）**：温度约为 850 K（模型最优反演约 858 K）。
- **炽热的傍晚边缘（昏界 / 东侧）**：温度约为 1,500 K（模型最优反演约 1,522 K）。
- **晨昏温差与大气膨胀**：两侧温差高达约 650 K（约 650 °C / 1,170 °F）。炽热的傍晚侧大气由于气体温度高，大气标高（scale height）显著增大，密度随高度衰减更为平缓，向外太空延伸的范围足足是清晨侧的约 1.8 倍！
- **成分一致性**：尽管温度与厚度截然不同，水蒸气（H₂O）与二氧化碳（CO₂）的丰度在环状边缘各处大体保持一致，表明剧烈的温差并不意味着所有化学组分都按相同方式分化。
- **动力学成因**：强劲的超音速赤道喷流将大量热量从永恒昼半球沿傍晚边缘吹送（炽热、极度蓬松的气体），随后气流掠过寒冷的夜半球冷却降温，最终抵达清晨边缘时已大幅降温收缩。这完美契合了环流风系运送热量的理论流体动力学预测。

### 领衔科学家原声

第一作者莉莉·奥尔德森（Lili Alderson）指出：
> “Rather than assuming your atmosphere is a circle with the same radius all the way around, our technique allows you to pull out different distances from the centre to the edge of the planet.”
> （“以往的方法假设整个大气层是一个各处半径相同的圆，而我们的技术允许你提取出行星中心到边缘各处不同的真实距离。”）

奥尔德森博士进一步强调：
> “This is proof of concept that planets are in fact 3D objects, and that consistently, as they go around their star, what we predict should be happening is happening.”
> （“这项概念验证表明，行星在本质上是立体的三维天体；随着它们绕恒星公转，理论预测应当发生的物理图景正在真实上演。”）

### 科学严谨性特别说明

必须明确指出：本研究所得温度为基于行星透射光谱的大气模型反演推算值，并非在行星现场用温度计直接测量得到，数值带有模型不确定度（其中清晨侧因温度较低受约束相对宽松），均应作为“约数”理解。此外，页面中所有行星大气边缘几何形状与凌星投影均为**示意性图解（schematic illustrations）**，旨在帮助读者直观理解不对称膨胀与透射弦原理，绝非行星的真实尺度光学照片。最后，WASP-17 b 是一颗温度高达上千度、无固态表面的气态热木星，**绝非宜居行星**。

---
> *本文由 AI 生成。*
