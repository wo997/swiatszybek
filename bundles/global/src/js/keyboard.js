/* js[global] */

let CTRL_DOWN = false;
let ALT_DOWN = false;
let SHIFT_DOWN = false;
document.addEventListener("keydown", (ev) => {
	CTRL_DOWN = ev.ctrlKey;
	ALT_DOWN = ev.altKey;
	SHIFT_DOWN = ev.shiftKey;
});
document.addEventListener("keyup", () => {
	CTRL_DOWN = false;
	ALT_DOWN = false;
	SHIFT_DOWN = false;
});
