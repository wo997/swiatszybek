/* js[global] */

window.addEventListener("DOMContentLoaded", scaleVideos);
window.addEventListener("resize", scaleVideos);
function scaleVideos() {
	$$("iframe.ql-video").forEach((e) => {
		var h = Math.round(0.56 * e.getBoundingClientRect().width);
		if (h > 500) h = 500;
		e.style.height = h + "px";
	});
}

function stopAllVideos() {
	/** @type {HTMLVideoElement[]} */
	// @ts-ignore
	var videos = $$("video");
	for (const video of videos) {
		video.pause();
	}
}
