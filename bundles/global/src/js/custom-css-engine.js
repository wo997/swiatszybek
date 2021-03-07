/* js[global] */

window.addEventListener("resize", function () {
	resizeCallback();

	delay("resizeCallback", 200);
});
domload(() => {
	resizeCallback();
});

function resizeCallback() {
	setCustomHeights();
}

function setCustomHeights() {
	$$("[data-height]").forEach((node) => {
		if (node._parent(".showing_modal")) {
			return;
		}

		let height = node.dataset.height;
		if (height.indexOf("w") !== -1) {
			const r = node.getBoundingClientRect();

			if (!r.width) {
				return;
			}

			height = height.replace("w", "");
			const real_height = Math.floor(r.width * parseFloat(height));

			if (Math.abs(r.height - real_height) > 2) {
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
