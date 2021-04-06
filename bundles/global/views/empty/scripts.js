/* js[view] */

domload(() => {
	window.parent.postMessage("iframe_domload", "*");
	window.postMessage("iframe_domload", "*");
});
