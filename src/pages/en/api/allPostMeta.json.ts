import { getPreferredPosts } from "@/utils/content-utils";
import { getPostUrlBySlug } from "@/utils/url-utils";
import { taxonomyDisplayName } from "@/i18n/taxonomy";

export async function GET(): Promise<Response> {
	const posts = await getPreferredPosts("en");
	return Response.json(
		posts
			.map((post) => ({
				id: post.id,
				url: getPostUrlBySlug(post.id, post.data.lang),
				title: post.data.title,
				description: post.data.description,
				published: post.data.published.getTime(),
				category: taxonomyDisplayName(post.data.category || "", "en"),
				password: !!post.data.password,
			}))
			.sort((a, b) => b.published - a.published),
	);
}
