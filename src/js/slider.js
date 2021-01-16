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
		slider._release_slider();
	});
}

/** @type {PiepSlider[]} */
let wo997_sliders = [];
let next_slider_id = 0;
function animateSliders() {
	wo997_sliders.forEach((slider) => {
		const slides_container = slider._slides_container;

		let follow_rate = 0.5;

		const bounce_rate = 0.1;
		const slow_rate = 0.5;
		if (slider._scroll < slider._min_scroll) {
			slider._scroll = slider._scroll * (1 - bounce_rate);
			slider._velocity *= slow_rate;
		}
		if (slider._scroll > slider._max_scroll) {
			slider._scroll =
				slider._scroll * (1 - bounce_rate) + slider._max_scroll * bounce_rate;
			slider._velocity *= slow_rate;

			follow_rate = 0.2;
		}

		slider.classList.toggle(
			"first_slide",
			slider._scroll < slider._slide_width * 0.5
		);
		slider.classList.toggle(
			"last_slide",
			slider._scroll > slider._max_scroll - slider._slide_width * 0.5
		);

		if (slider._grabbed_at_scroll !== undefined) {
			const target_velocity = slider._last_input_scroll - slider._input_scroll;

			slider._velocity =
				target_velocity * follow_rate + slider._velocity * (1 - follow_rate);
			slider._last_input_scroll = slider._input_scroll;

			slider._scroll =
				slider._grabbed_at_scroll +
				slider._grabbed_input_scroll -
				slider._input_scroll;
		} else {
			if (slider._just_released === true) {
				const was_slide_id = slider._slide_id;
				const sensitivity_speed = 2500 / slider._slide_width; // avg swipe speed
				let jumps = slider._velocity / sensitivity_speed;

				const max_jump = Math.floor(
					slider.offsetWidth / slider._slide_width + 0.01
				);

				jumps +=
					Math.round(slider._scroll / slider._slide_width) - was_slide_id;

				if (Math.round(jumps) === 0 && Math.abs(slider._velocity) > 0.5) {
					jumps = Math.sign(slider._velocity);
				}
				slider._set_slide(
					slider._slide_id + Math.round(clamp(-max_jump, jumps, max_jump))
				);

				slider._just_released = false;
			}

			const target_scroll = slider._slide_id * slider._slide_width;

			slider._velocity +=
				(target_scroll - (slider._scroll + slider._velocity * 10)) * 0.05;

			slider._scroll += slider._velocity;
		}

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
 * _grabbed_input_scroll: number
 * _input_scroll: number
 * _last_input_scroll: number
 * _release_slider()
 * _resize()
 * _slide_width: number
 * _slide_id: number
 * _just_released: boolean
 * _set_slide(id: number)
 * _update_slider()
 * _max_scroll: number
 * _min_scroll: number
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
		if (slider._grabbed_at_scroll !== undefined) {
			slider._just_released = true;
		}
		slider._grabbed_at_scroll = undefined;
		slider._input_scroll = undefined;
		slider._last_input_scroll = undefined;
		slider._grabbed_input_scroll = undefined;
	};

	slider._resize = () => {
		const target_width = evalCss(slider.dataset.slide_width, slider);
		let show_next_mobile = def(slider.dataset.show_next_mobile, "0");
		if (show_next_mobile === "") {
			show_next_mobile = "0.5";
		}
		show_next_mobile = parseFloat(show_next_mobile);

		const edge_offset = IS_TOUCH_DEVICE ? show_next_mobile : 0;
		const slider_width = slider.offsetWidth;
		const visible_slide_count = slider_width / target_width;
		const slide_width =
			(target_width * visible_slide_count) /
			(Math.max(1, Math.round(visible_slide_count)) + edge_offset);

		slider._slide_width = slide_width;
		slider.style.setProperty("--slide_width", `${slide_width.toFixed(1)}px`);

		slider._update_slider();
	};

	slider._set_slide = (id) => {
		const slide_count = Math.round(slider._max_scroll / slider._slide_width);
		slider._slide_id = clamp(0, id, slide_count);
	};

	slider._update_slider = () => {
		slider._min_scroll = 0;
		slider._max_scroll = slides_container.offsetWidth - slider.offsetWidth;
	};

	/**
	 *
	 * @param {number} pos_x
	 */
	const grab = (pos_x) => {
		if (slider._grabbed_at_scroll !== undefined) {
			return;
		}
		slider._grabbed_at_scroll = slider._scroll;
		slider._input_scroll = pos_x;
		slider._last_input_scroll = pos_x;
		slider._grabbed_input_scroll = pos_x;
		slider._velocity = 0;
		slider._just_released = false;
	};

	/**
	 *
	 * @param {number} pos_x
	 */
	const scroll = (pos_x) => {
		if (slider._grabbed_at_scroll === undefined) {
			return;
		}

		slider._input_scroll = pos_x;
	};

	slides_container.addEventListener("touchstart", (ev) => {
		const touch = ev.targetTouches[0];
		if (touch) {
			grab(touch.clientX);
		}
	});

	slides_container.addEventListener("touchmove", (ev) => {
		const touch = ev.targetTouches[0];
		if (touch) {
			scroll(touch.clientX);
		}
		ev.preventDefault();
	});

	slides_container.addEventListener("mousedown", (ev) => {
		grab(ev.clientX);
	});

	slides_container.addEventListener("mousemove", (ev) => {
		scroll(ev.clientX);
		ev.preventDefault();
	});

	slider._velocity = 0;
	slider._scroll = 0;
	slider._just_released = false;
	slider._slide_id = 0;

	slider._release_slider();
	slider._resize();

	wo997_sliders.push(slider);

	slider.insertAdjacentHTML(
		"beforeend",
		/*html*/ `
            <div class="nav nav_prev">${ICONS.chevron_left}</div>
            <div class="nav nav_next">${ICONS.chevron_left}</div>
        `
	);

	const nav_prev = slider._child(".nav_prev");
	const prev_svg = nav_prev._child("svg");

	const nav_next = slider._child(".nav_next");
	const next_svg = nav_next._child("svg");

	const animate_nav = (svg) => {
		svg._animate(
			`
                0% {transform: translate(0,0);}
                30% {transform: translate(-3px,0);}
                100% {transform:translate(0,0);}
            `,
			200
		);
	};
	nav_prev.addEventListener("click", () => {
		slider._set_slide(slider._slide_id - 1);
		animate_nav(prev_svg);
	});
	nav_next.addEventListener("click", () => {
		slider._set_slide(slider._slide_id + 1);
		animate_nav(next_svg);
	});
}
