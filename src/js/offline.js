/* js[global] */

function updateOnlineStatus() {
	$(".offline").classList.toggle("shown", !navigator.onLine);
}
domload(() => {
	window.addEventListener("offline", () => {
		updateOnlineStatus();
	});
	window.addEventListener("online", () => {
		updateOnlineStatus();
	});
});
