/* js[global] */

let IS_TOUCH_DEVICE = isTouchDevice();
const IS_MAC_LIKE = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
const IS_IOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
const IS_APPLE = IS_MAC_LIKE || IS_IOS;

function isTouchDevice() {
	return (
		"ontouchstart" in window ||
		navigator.maxTouchPoints > 0 ||
		navigator.msMaxTouchPoints > 0
	);
}
window.addEventListener("resize", () => {
	IS_TOUCH_DEVICE = isTouchDevice();
});
