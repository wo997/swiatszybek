/* js[view] */

domload(() => {
	const header = $("header.main");
	if (header) {
		header.classList.add("stiff");
	}
	window.parent.postMessage("iframe_domload", "*");
	window.postMessage("iframe_domload", "*");
});
