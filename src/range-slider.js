/* js[admin] */

// window.addEventListener("register-form-components", (ev) => {
// 	setTimeout(() => {
// 		// @ts-ignore
// 		registerRangeSliders(ev.detail.parent);
// 	}, 0);
// });

// /**
//  *
//  * @param {PiepNode} parent
//  */
// function registerRangeSliders(parent) {
// 	parent._children

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerRangeSliders(ev.detail.parent);
});

/**
 *
 * @param {PiepNode} parent
 */
function registerRangeSliders(parent) {
	parent._children("input[type=range]:not(.range)").forEach((range) => {
		var background = range.getAttribute("data-background");
		var cl = range.getAttribute("data-class");

		range.insertAdjacentHTML(
			"afterend",
			html`<div class="range-wrap">
				<div class="range-rect"></div>
				${range.outerHTML}
				<output class="bubble"></output>
			</div>`
		);

		const wrap = range._next();

		range.remove();

		range = wrap._child("input[type=range]");
		range.classList.add("range");

		if (cl) {
			range.classList.add(cl);
			wrap.classList.add(cl + "-wrapper");
		}

		const rect = wrap._child(".range-rect");
		if (background) rect.style.background = background;

		const bubble = wrap.querySelector(".bubble");

		range.addEventListener("input", () => {
			setBubble(range, bubble);
		});
		range.addEventListener("change", () => {
			setBubble(range, bubble);
		});

		setBubble(range, bubble);
	});

	function setBubble(range, bubble) {
		const val = range.value;

		const min = range.min || 0;
		const max = range.max || 100;

		const part = (val - min) / (max - min);
		bubble.textContent = val;

		bubble.style.left = `${part * 100}%`;
		bubble.style.transform = `translate(-${part * 100}%,-50%)`;
	}
}

function setRangeSliderValue(slider, value) {
	slider.value = value;
	slider._dispatch_change();
}
