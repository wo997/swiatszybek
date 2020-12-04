/* js[global] */

function loadScript(src, attributes = {}, options = {}) {
	var script = document.createElement("script");
	Object.entries(attributes).forEach(([key, value]) => {
		script.setAttribute(key, value);
	});
	script.src = src;

	loadFileAsNode(script, options);
}

function loadStylesheet(href, attributes = {}, options = {}) {
	var link = document.createElement("link");
	Object.entries(attributes).forEach(([key, value]) => {
		link.setAttribute(key, value);
	});
	link.href = href;

	loadFileAsNode(link, options);
}

function loadFileAsNode(node, options = {}) {
	if (document.body) {
		document.body.appendChild(node);
	} else {
		domload(() => {
			document.body.appendChild(node);
		});
	}

	if (options.callback) {
		node.addEventListener("load", () => {
			options.callback();
		});
	}
}
