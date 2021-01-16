/* js[global] */

domload(() => {
	const slider = $(".slider_x");
	initSlider(slider);

	animateSliders();

	document.addEventListener("mouseup", releaseAllSliders);
	document.addEventListener("touchend", releaseAllSliders);
});

function releaseAllSliders() {
	wo997_sliders.forEach((slider) => {
		slider._grabbed_at_scroll = undefined;
		slider._scroll_grabbed = undefined;
		slider._last_scroll_grabbed = undefined;
	});
}

/** @type {PiepSlider[]} */
let wo997_sliders = [];
let next_slider_id = 0;
function animateSliders() {
	wo997_sliders.forEach((slider) => {
		const slides_container = slider._slides_container;

		const min_scroll = 0;
		const max_scroll = slides_container.offsetWidth - slider.offsetWidth;

		let follow_rate = 1;

		const bounce_rate = 0.1;
		const slow_rate = 0.5;
		if (slider._scroll < min_scroll) {
			slider._scroll = slider._scroll * (1 - bounce_rate);
			slider._velocity *= slow_rate;
		}
		if (slider._scroll > max_scroll) {
			slider._scroll =
				slider._scroll * (1 - bounce_rate) + max_scroll * bounce_rate;
			slider._velocity *= slow_rate;

			follow_rate = 0.2;
		}

		if (slider._grabbed_at_scroll) {
			const target_velocity =
				slider._last_scroll_grabbed - slider._scroll_grabbed;

			slider._velocity =
				target_velocity * follow_rate + slider._velocity * (1 - follow_rate);
			slider._last_scroll_grabbed = slider._scroll_grabbed;
		} else {
			slider._velocity *= 0.9;
		}

		slider._scroll += slider._velocity;

		slides_container.style.transform = `translateX(${
			Math.round(-slider._scroll * 10) * 0.1
		}px)`;
	});

	requestAnimationFrame(animateSliders);
}

window.addEventListener("resize", () => {
	wo997_sliders.forEach((slider) => {
		slider._resize();
	});
});

/**
 * @typedef {{
 * _scroll: number
 * _velocity: number
 * _slides_container: PiepNode
 * _grabbed_at_scroll: number
 * _scroll_grabbed: number
 * _last_scroll_grabbed: number
 * _release_slider()
 * _resize()
 * } & PiepNode} PiepSlider
 */

/**
 *
 * @param {PiepNode} node
 */
function initSlider(node) {
	/** @type {PiepSlider} */
	// @ts-ignore
	const slider = node;
	const slides_container = slider._child(".wo997_slides_container");
	//const slides = slides_container._direct_children();

	slider._slides_container = slides_container;

	slider._release_slider = () => {
		slider._grabbed_at_scroll = undefined;
		slider._scroll_grabbed = undefined;
		slider._last_scroll_grabbed = undefined;
	};

	slider._resize = () => {
		const width = evalCss(slider.dataset.slide_width, slider).toFixed(1);
		slider.style.setProperty("--slide-width", `${width}px`);
	};

	/**
	 *
	 * @param {number} pos_x
	 */
	const grab = (pos_x) => {
		if (slider._grabbed_at_scroll !== undefined) {
			return;
		}
		slider._grabbed_at_scroll = pos_x;
		slider._scroll_grabbed = pos_x;
		slider._last_scroll_grabbed = pos_x;
	};

	/**
	 *
	 * @param {number} pos_x
	 */
	const scroll = (pos_x) => {
		if (slider._grabbed_at_scroll === undefined) {
			return;
		}
		slider._scroll_grabbed = pos_x;
	};

	slider.addEventListener("touchstart", (ev) => {
		const touch = ev.targetTouches[0];
		if (touch) {
			grab(touch.clientX);
		}
	});

	slider.addEventListener("touchmove", (ev) => {
		const touch = ev.targetTouches[0];
		if (touch) {
			scroll(touch.clientX);
		}
		ev.preventDefault();
	});

	slider.addEventListener("mousedown", (ev) => {
		grab(ev.clientX);
	});

	slider.addEventListener("mousemove", (ev) => {
		scroll(ev.clientX);
		ev.preventDefault();
	});

	slider._velocity = 0;
	slider._scroll = 0;

	slider._release_slider();
	slider._resize();

	wo997_sliders.push(slider);
}
