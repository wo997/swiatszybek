/* js[global] */

function loadScript(src, options = {}) {
	var script = document.createElement("script");
	Object.entries(options).forEach(([key, value]) => {
		script.setAttribute(key, value);
	});
	script.src = src;

	loadFileAsNode(script);
}

function loadStylesheet(href, options = {}) {
	var link = document.createElement("link");
	Object.entries(options).forEach(([key, value]) => {
		link.setAttribute(key, value);
	});
	link.href = href;

	loadFileAsNode(link);
}

function loadFileAsNode(node) {
	if (document.body) {
		document.body.appendChild(node);
	} else {
		domload(() => {
			document.body.appendChild(node);
		});
	}
}
