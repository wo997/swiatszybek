/* js[global] */

const IS_MOBILE = "ontouchstart" in document.documentElement;
const IS_MAC_LIKE = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
const IS_IOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);
const IS_APPLE = IS_MAC_LIKE || IS_IOS;
