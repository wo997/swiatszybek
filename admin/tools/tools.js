/* js[admin] */

var toolList = [];
function useTool(name) {
	if (toolList.includes(name)) {
		return;
	}
	toolList.push(name);
	var el = document.createElement("script");
	el.src = `/admin/tools/${name}.js?v=${RELEASE}`;
	if (document.body) {
		document.body.appendChild(el);
	} else {
		domload(() => {
			document.body.appendChild(el);
		});
	}
}
