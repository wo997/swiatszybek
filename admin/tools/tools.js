/* js[admin] */

var toolList = [];

/**
 * @param {string} name
 */
function useTool(name) {
	if (toolList.includes(name)) {
		return;
	}
	toolList.push(name);

	loadScript(
		`/builds/tool_${name}.js?v=${JS_RELEASE}`,
		{},
		{
			callback: () => {
				window[`init_tool_${name}`]();
			},
		}
	);

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
