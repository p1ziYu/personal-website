/** Display names only: canonical category/tag values remain unchanged in URLs. */
const names: Record<string, { en: string; aliases?: string[] }> = {
	折腾: { en: "Tinkering" },
	指南: { en: "Guide", aliases: ["Guides"] },
	随笔: { en: "Notes", aliases: ["Essays"] },
	写作: { en: "Writing" },
	站务: { en: "Site Meta" },
	记录: { en: "Journal" },
	域名: { en: "Domain" },
};

export function canonicalTaxonomyName(name: string): string {
	const value = name.trim();
	return (
		Object.keys(names).find(
			(key) =>
				key === value ||
				names[key].en === value ||
				names[key].aliases?.includes(value),
		) || value
	);
}

export function taxonomyDisplayName(name: string, lang?: string): string {
	return lang === "en" ? names[canonicalTaxonomyName(name)]?.en || name : name;
}
