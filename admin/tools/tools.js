/* js[admin] */

var toolList = [];

/**
 * @param {string} name
 */
async function useTool(name) {
	if (toolList.includes(name)) {
		return;
	}
	toolList.push(name);

	const a = await loadScript(
		`/builds/tool_${name}.js?v=${JS_RELEASE}`,
		{},
		{
			callback: () => {
				const func = window[`init_tool_js_${name}`];
				if (func) {
					func();
				}
			},
		}
	);
	const b = await loadStylesheet(
		`/builds/tool_${name}.css?v=${CSS_RELEASE}`,
		{},
		{
			callback: () => {
				const func = window[`init_tool_css_${name}`];
				if (func) {
					func();
				}
			},
		}
	);
	const func = window[`init_tool_fully_${name}`];
	if (func) {
		func();
	}
	// cute
	//console.log(a, `/builds/tool_${name}.js?v=${JS_RELEASE}`, b);

	/*loadScript(
		`/admin/tools/${name}/main.js?v=${RELEASE}`,
		{
			type: "module",
		},
		{
			callback: () => {
				window[`init${name.capitalize()}`]();
			},
		}
	);*/
}
