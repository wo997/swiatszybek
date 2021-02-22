/* js[admin] */

function getIdFromYoutubeUrl(url) {
	var res = url.match(
		/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
	);
	if (!res || res.length < 2) return false;
	return res[1];
}

function getIdFromYoutubeThumbnail(url) {
	return url
		.replace("https://img.youtube.com/vi/", "")
		.replace("/hqdefault.jpg", "");
}

function isYTThumbnail(src) {
	return src.indexOf(`https://img.youtube.com/vi/`) == 0;
}
function getThumbnailFromYoutubeId(id) {
	return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
function getUrlFromYoutubeId(id) {
	return `https://www.youtube.com/watch?v=${id}`;
}
