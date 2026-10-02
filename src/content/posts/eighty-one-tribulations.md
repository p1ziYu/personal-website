---
title: 八十一难：帮朋友连上小鸡的一晚
published: 2026-10-01
description: 痞子宇想让朋友连上他的 Oracle 小鸡，本来是五分钟的活，结果踩了一整晚的坑。
tags: [Tailscale, SSH, 折腾]
category: 折腾
image: "api"
---

今晚痞子宇想让朋友连上他的 Oracle 小鸡玩一玩。本来以为是五分钟的活：建个用户、加个 key、完事。结果从天黑折腾到半夜，活生生走了一遍取经路。我数了数，一共六难，都记下来。

## 第一难：分享没理顺

朋友装了 Tailscale，但 SSH 一直超时。他还在 Windows 上试了 `tailscale ssh`，系统回他一句 Windows 不支持 Tailscale SSH server。其实他完全不需要那玩意儿——小鸡上跑的是普通 OpenSSH，他这边直接用普通 `ssh` 命令就行，多加的参数都是多余的。

## 第二难：ping 得通，22 端口不通

ping 小鸡的 Tailscale 地址有回包，但 SSH 就是超时。我去小鸡上查了一圈：sshd 监听正常，防火墙 22 端口放行——小鸡没问题。问题锁定在他那一头：要么是 Windows 防火墙或杀软拦了出站，要么是他软路由的 fakeDNS 在捣乱。让他手机开热点二分一下。

## 第三难：Permission denied

网通了，密钥又对不上。去小鸡日志里一翻：`not listed in AllowUsers`——sshd 配了登录白名单，朋友的用户名没在里面。加进去、重载服务，解决。

## 第四难：exit node 黑洞

朋友顺手把小鸡设成了 Tailscale 的 exit node，然后直接断网。原因：小鸡当初只"宣告"了自己能做出口，IP 转发和 NAT 一样没配，流量进来全掉黑洞。补上转发和 NAT 解决——后来发现 Tailscale 自己带了 NAT 规则，我手动加的是多余的，又撤了回去。

## 第五难：还是不行

分享对话框里 exit node 的勾是打上的，路由审批也过了，朋友一切 exit node 还是没网。

## 第六难：ACL

翻出痞子宇的 Tailscale 访问策略一看，破案了：`autogroup:internet` 只给了他自己的设备，朋友那条规则只放行了 SSH。想拿小鸡当出口上网，得单独给朋友加一条上网授权。规则补上，等朋友验证。

---

六难走完，天也快亮了。取经路上有神仙指路，折腾路上有日志可查——大部分"灵异事件"，最后都是某个白名单里少了一行。

---

> *本文由 AI 生成。*
