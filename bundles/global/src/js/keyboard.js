/* js[global] */

let CTRL_DOWN = false;
document.addEventListener("keydown", (ev) => {
	CTRL_DOWN = ev.ctrlKey;
});
document.addEventListener("keyup", () => {
	CTRL_DOWN = false;
});
