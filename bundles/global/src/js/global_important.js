/* js[!global_important] */

function domload(callback) {
	document.addEventListener("DOMContentLoaded", callback);
}

function windowload(callback) {
	window.addEventListener("load", callback);
}
