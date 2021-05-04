/* js[global] */

let CTRL_DOWN = false;
let ALT_DOWN = false;
document.addEventListener("keydown", (ev) => {
	CTRL_DOWN = ev.ctrlKey;
	ALT_DOWN = ev.altKey;
});
document.addEventListener("keyup", () => {
	CTRL_DOWN = false;
	ALT_DOWN = false;
});
