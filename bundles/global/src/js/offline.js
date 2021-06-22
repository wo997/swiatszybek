/* js[global] */

function updateOnlineStatus() {
	$(".offline").classList.toggle("shown", !navigator.onLine);
}
domload(() => {
	document.body.insertAdjacentHTML(
		"beforeend",
		html`<div class="offline"><i class="fas fa-exclamation-circle"></i> Brak połączenia z internetem!</div>`
	);
	window.addEventListener("offline", () => {
		updateOnlineStatus();
	});
	window.addEventListener("online", () => {
		updateOnlineStatus();
	});
});
