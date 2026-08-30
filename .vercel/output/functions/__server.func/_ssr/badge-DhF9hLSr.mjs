import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn } from "./router-BANUKJte.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-DhF9hLSr.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", {
			muted: "bg-surface-2 text-muted",
			income: "bg-income/10 text-income",
			danger: "bg-danger/10 text-danger",
			accent: "bg-accent/10 text-accent"
		}[tone], className),
		...props
	});
}
//#endregion
export { Badge as t };
