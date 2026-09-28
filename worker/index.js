// Cloudflare Worker 入口（由 wrangler.jsonc 的 "main" 字段加载）。
// 职责只有静态资源托管：其余请求交给 env.ASSETS，未匹配路径由
// wrangler.jsonc 的 not_found_handling: "404-page" 决定。
// 原网易云音乐代理接口已随侧边栏播放器移除，路径保留但直接返回 400，
// 以免旧客户端或书签请求落到静态资源上误返回 HTML。

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
	"Access-Control-Max-Age": "86400",
};

const DISABLED_ROUTES = new Set(["/api/netease/song", "/api/netease/playlist"]);

export default {
	async fetch(request, env) {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}
		// 兼容带/不带尾斜杠的路径（站点 trailingSlash 约定为 always）
		const pathname = new URL(request.url).pathname.replace(/\/+$/, "");
		if (DISABLED_ROUTES.has(pathname)) {
			return new Response("Bad Request", {
				status: 400,
				headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS_HEADERS },
			});
		}
		return env.ASSETS.fetch(request);
	},
};
