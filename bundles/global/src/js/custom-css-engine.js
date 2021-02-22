/* js[global] */

// TODO: HEYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
// should the modal really freeze/duplicate when showing up to maintain data-height?
// that sucks af, you better set it in the first frame, then call showModal and voila!

const MOBILE_WIDTH = 800;

window.addEventListener("resize", function () {
	resizeCallback();

	delay("resizeCallback", 200);
});
domload(function () {
	resizeCallback();
});

function resizeCallback() {
	setCustomHeights();
}

function setCustomHeights() {
	$$("[data-height]").forEach((node) => {
		var height = node.getAttribute("data-height");
		if (height.indexOf("w") !== -1) {
			var r = node.getBoundingClientRect();

			if (!r.width) {
				return;
			}

			height = height.replace("w", "");
			var real_height = Math.floor(r.width * parseFloat(height));

			if (Math.abs(parseInt(r.height) - real_height) > 2) {
				node.style.height = `${real_height}px`;
			}
		} else {
			node.style.height = height;
		}
	});
}

function fixHeightsAutomatically() {
	setCustomHeights();
	setTimeout(fixHeightsAutomatically, 500);
}
fixHeightsAutomatically();

/**
 * Can be used in base cases
 *
 * @param {*} val
 * @param {PiepNode} node
 * @param {*} params
 * @returns {number}
 */
function evalCss(val, node = null, params = {}) {
	// TODO: go for computed style only if it's set to auto?
	if (!val || !val.trim()) {
		return 0;
	}
	const percent = def(node && node._parent(), document.body).clientWidth * 0.01;

	const vw = document.body.offsetWidth * 0.01;
	const vh = document.body.offsetHeight * 0.01;
	val = val.replace(/%/g, "*" + percent);
	val = val.replace(/vw/g, "*" + vw);
	val = val.replace(/vh/g, "*" + vh);
	val = val.replace(/px/g, "");

	return eval(escapeNumericalExpression(val));
}
