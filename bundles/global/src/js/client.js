/* js[global] */

let IS_TOUCH_DEVICE = false;
setTouchDevice();
const IS_MAC_LIKE = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
const IS_IOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
const IS_APPLE = IS_MAC_LIKE || IS_IOS;

function setTouchDevice() {
	IS_TOUCH_DEVICE = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

	const setClass = () => {
		document.body.classList.toggle("touch_device", IS_TOUCH_DEVICE);
		document.body.classList.toggle("no_touch", !IS_TOUCH_DEVICE);
	};
	if (document.body) {
		setClass();
	} else {
		domload(setClass);
	}
}
window.addEventListener("resize", () => {
	setTouchDevice();
});
