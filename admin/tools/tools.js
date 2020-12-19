/* js[admin] */

var toolList = [];

/**
 * @param {string} name
 */
async function useTool(name, callback = {}) {
	if (toolList.includes(name)) {
		return;
	}
	toolList.push(name);

	// @ts-ignore
	Promise.allSettled([
		loadScript(
			`/builds/tool_${name}.js?v=${JS_RELEASE}`,
			{},
			{
				callback: () => {
					window.dispatchEvent(
						new CustomEvent("tool_loaded", {
							detail: {
								name: name,
								info: "js",
							},
						})
					);
				},
			}
		),
		loadStylesheet(
			`/builds/tool_${name}.css?v=${CSS_RELEASE}`,
			{},
			{
				callback: () => {
					window.dispatchEvent(
						new CustomEvent("tool_loaded", {
							detail: {
								name: name,
								info: "css",
							},
						})
					);
				},
			}
		),
	]).then((results) => {
		window.dispatchEvent(
			new CustomEvent("tool_loaded", {
				detail: {
					name: name,
					info: "all",
				},
			})
		);
	});
}
