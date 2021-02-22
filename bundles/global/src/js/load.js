/* js[global] */

function loadScript(src, attributes = {}, options = {}) {
	var script = document.createElement("script");
	Object.entries(attributes).forEach(([key, value]) => {
		script.setAttribute(key, value);
	});
	script.src = src;

	return loadFileAsNode(script, options);
}

function loadStylesheet(href, attributes = {}, options = {}) {
	var link = document.createElement("link");
	Object.entries(attributes).forEach(([key, value]) => {
		link.setAttribute(key, value);
	});
	link.href = href;
	link.rel = "stylesheet";

	return loadFileAsNode(link, options);
}

async function loadFileAsNode(node, options = {}) {
	return new Promise((resolve) => {
		const work = () => {
			document.body.appendChild(node);

			if (options.callback) {
				node.addEventListener("load", () => {
					options.callback();
					resolve("loaded");
				});
				node.addEventListener("error", () => {
					resolve("error");
				});
			} else {
				resolve();
			}
		};

		if (document.body) {
			work();
		} else {
			domload(() => {
				work();
			});
		}
	});
}
