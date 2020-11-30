/* js[admin] */

var toolList = [];
function useTool(name) {
	if (toolList.includes(name)) {
		return;
	}
	toolList.push(name);

	loadScript(`/admin/tools/${name}/main.js?v=${RELEASE}`, {
		type: "module",
	});
}
