/* js[view] */

domload(() => {
	console.log(window.parent.innerWidth, window.innerWidth);
	window.parent.postMessage("iframe_domload", "*");
	window.postMessage("iframe_domload", "*");
});
