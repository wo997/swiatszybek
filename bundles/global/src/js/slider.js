/* js[global] */

let let_click_slide = false;

function initSliders() {
	$$(".wo997_slider:not(.wo997_slider_ready)").forEach((slider) => {
		initSlider(slider);
	});
}

domload(() => {
	initSliders();

	animateSliders();

	document.addEventListener("mousedown", (ev) => {
		let_click_slide = true;
	});
	document.addEventListener("click", (ev) => {
		if (!let_click_slide) {
			ev.preventDefault();
		}
	});

	document.addEventListener("mouseup", releaseAllSliders);
	document.addEventListener("touchend", releaseAllSliders);

	const resz = () => {
		initSliders();
		wo997_sliders.forEach((node) => {
			node._slider.update();
		});
		$$(`[data-nav_out_from]`).forEach((e) => {
			e.classList.toggle("nav_out", window.innerWidth > evalCss(e.dataset.nav_out_from));
		});
	};

	window.addEventListener("resize", resz);

	resz();
	lazyLoadImages();
});

window.addEventListener("dragstart", (event) => {
	const target = $(event.target);
	if (target._parent(".wo997_slider")) {
		event.preventDefault();
		return false;
	}
});

function releaseAllSliders() {
	wo997_sliders.forEach((node) => {
		node._slider.release();
	});
}

/** @type {PiepSliderNode[]} */
let wo997_sliders = [];
let next_slider_id = 0;
function animateSliders() {
	wo997_sliders.forEach((node) => {
		const slider = node._slider;
		const slides_wrapper = slider.slides_wrapper;

		let follow_rate = 0.5;

		const bounce_rate = 0.1;
		const slow_rate = 0.5;
		if (slider.scroll < slider.min_scroll) {
			slider.scroll = slider.scroll * (1 - bounce_rate);
			slider.velocity *= slow_rate;
		}
		if (slider.scroll > slider.max_scroll) {
			slider.scroll = slider.scroll * (1 - bounce_rate) + slider.max_scroll * bounce_rate;
			slider.velocity *= slow_rate;

			follow_rate = 0.2;
		}

		node.classList.toggle("first_slide", slider.scroll < slider.slide_width * 0.5);
		node.classList.toggle("last_slide", slider.scroll > slider.max_scroll - slider.slide_width * 0.5);

		if (slider.grabbed_at_scroll !== undefined) {
			const targetvelocity = slider.last_input_x - slider.input_x;

			slider.velocity = targetvelocity * follow_rate + slider.velocity * (1 - follow_rate);
			slider.last_input_x = slider.input_x;

			let target_scroll = slider.grabbed_at_scroll + slider.grabbed_input_x - slider.input_x;

			/**
			 *
			 * @param {number} x
			 */
			const smooth = (x) => {
				return 20 * (1 - 20 / (20 + x)) + 0.05 * x;
			};

			if (target_scroll > slider.max_scroll) {
				target_scroll = slider.max_scroll + smooth(target_scroll - slider.max_scroll);
			}

			if (target_scroll < slider.min_scroll) {
				target_scroll = slider.min_scroll - smooth(slider.min_scroll - target_scroll);
			}

			slider.scroll = target_scroll;
		} else {
			if (slider.just_released === true) {
				const was_slide_id = slider.slide_id;
				const sensitivity_speed = 2500 / slider.slide_width; // avg swipe speed
				let jumps = slider.velocity / sensitivity_speed;

				const max_jump = Math.floor(node.offsetWidth / slider.slide_width + 0.01);

				jumps += Math.round(slider.scroll / slider.slide_width) - was_slide_id;

				if (Math.round(jumps) === 0 && Math.abs(slider.velocity) > 0.5) {
					jumps = Math.sign(slider.velocity);
				}
				slider.set_slide(slider.slide_id + Math.round(clamp(-max_jump, jumps, max_jump)));

				slider.just_released = false;
			}

			const target_scroll = clamp(slider.min_scroll, slider.slide_id * slider.slide_width, slider.max_scroll);

			slider.velocity += (target_scroll - (slider.scroll + slider.velocity * 10)) * 0.05;

			slider.scroll += slider.velocity;
		}

		if (slider.max_scroll < 1) {
			slides_wrapper.style.transform = `translateX(${Math.round(-slider.max_scroll * 0.5)}px)`;
		} else {
			slides_wrapper.style.transform = `translateX(${Math.round(-slider.scroll * 10) * 0.1}px)`;
		}
	});

	requestAnimationFrame(animateSliders);
}

/**
 * @typedef {{
 * scroll: number
 * velocity: number
 * slides_wrapper: PiepNode
 * slide_nodes?: PiepNode[]
 * slide_count?: number
 * grabbed_at_scroll: number
 * grabbed_input_x: number
 * grabbed_input_y: number
 * input_x: number
 * last_input_x: number
 * release()
 * resize()
 * slide_width?: number
 * visible_slide_count?: number
 * slide_id: number
 * just_released: boolean
 * just_grabbed: boolean
 * set_slide(id: number, options?: {duration?: number, big_jump_duration?: number})
 * update()
 * max_scroll: number
 * min_scroll: number
 * edge_offset: number
 * select_slide(id: number)
 * }} PiepSlider
 */

/**
 * @typedef {{
 * _slider: PiepSlider
 * } & PiepNode} PiepSliderNode
 */

/**
 *
 * @param {PiepNode} elem
 */
function initSlider(elem) {
	/** @type {PiepSliderNode} */
	// @ts-ignore
	const node = elem;

	node.classList.add("overflow_hidden", "wo997_slider", "wo997_slider_ready");

	const paginationChanged = () => {
		pagination._direct_children().forEach((e, i) => {
			e.classList.toggle("active", i === slider.slide_id);
		});
	};

	node._slider = {
		scroll: 0,
		velocity: 0,
		slides_wrapper: undefined,
		grabbed_at_scroll: undefined,
		grabbed_input_x: undefined,
		grabbed_input_y: undefined,
		input_x: undefined,
		last_input_x: undefined,
		slide_width: 0,
		slide_id: 0,
		just_released: false,
		just_grabbed: false,
		max_scroll: 0,
		min_scroll: 0,
		edge_offset: 0,
		release: () => {
			if (slider.grabbed_at_scroll !== undefined) {
				slider.just_released = true;
			}
			slider.grabbed_at_scroll = undefined;
			slider.input_x = undefined;
			slider.last_input_x = undefined;
			slider.grabbed_input_x = undefined;
			slider.grabbed_input_y = undefined;
		},
		resize: () => {
			const target_width = evalCss(def(node.dataset.slide_width, "100%"), node);
			let max_visible_count = +node.dataset.max_visible_count;

			const slider_width = node.offsetWidth;
			const temp_visible_slide_count = slider_width / target_width;

			let actual_slide_count = Math.max(1, Math.round(temp_visible_slide_count));
			if (max_visible_count) {
				if (slider.edge_offset) {
					max_visible_count--;
				}

				actual_slide_count = Math.min(actual_slide_count, max_visible_count);
			}
			actual_slide_count += slider.edge_offset;
			const slide_width = (target_width * temp_visible_slide_count) / actual_slide_count;

			slider.visible_slide_count = Math.ceil(slider_width / slide_width);
			slider.slide_width = slide_width;
			node.style.setProperty("--slide_width", `${slide_width.toFixed(1)}px`);
		},
		set_slide: (id, options = {}) => {
			const slide_count = Math.round((slider.max_scroll + slider.edge_offset) / slider.slide_width);
			//const was_slide = slider.slide_id;
			const will_slide = clamp(0, id, slide_count);
			//let delay = 0;
			//if (options.duration === 0 || (options.big_jump_duration === 0 && Math.abs(will_slide - was_slide) > 1)) {
			//delay = 100;
			//slider.slides_wrapper.style.animation = `blink ${delay * 2}ms`;
			//setTimeout(() => {
			if (options.big_jump_duration === 0) {
				slider.velocity = 0;
				slider.scroll = will_slide * slider.slide_width;
			}
			//setTimeout(() => {
			//slider.slides_wrapper.style.animation = "";
			//}, delay);
			//}, delay);
			// slider.slide_id = will_slide;
			// return;
			//}

			//setTimeout(() => {
			slider.slide_id = will_slide;
			node.dispatchEvent(
				new CustomEvent("slide_changed", {
					detail: {
						slide_id: slider.slide_id,
					},
				})
			);
			//}, delay);

			paginationChanged();
		},
		update: () => {
			let show_next_mobile = def(node.dataset.show_next_mobile, "0");
			if (show_next_mobile === "") {
				show_next_mobile = "0.5";
			}
			show_next_mobile = parseFloat(show_next_mobile);

			slider.edge_offset = IS_TOUCH_DEVICE ? show_next_mobile : 0;

			slider.resize();

			slider.min_scroll = 0;
			slider.max_scroll = slides_wrapper.offsetWidth - node.offsetWidth;

			slider.slide_nodes = slides_wrapper._direct_children();
			slider.slide_nodes.forEach((e, index) => {
				e.dataset.slide_id = index + "";
			});

			const slide_count = slider.slide_nodes.length;
			if (slider.slide_count !== slide_count) {
				let bullets = "";

				if (node.dataset.pagination === "bullets") {
					//if (slide_count < 7) {
					for (let i = 0; i < slide_count; i++) {
						bullets += html`<div class="bullet" data-slide_id="${i}"></div>`;
					}
					//    }
				}
				pagination._set_content(bullets);
				slider.slide_count = slide_count;
				paginationChanged();
			}

			slider.scroll = slider.slide_id * slider.slide_width;
			slider.velocity = 0;
		},
		select_slide: (id) => {
			slider.slide_nodes.forEach((e, i) => {
				e.classList.toggle("selected_slide", i === id);
			});

			const offset = Math.floor((node.clientWidth / slider.slide_width - 1) / 2 + 0.05);

			slider.set_slide(id - offset);
		},
	};
	const slider = node._slider;

	const slides_wrapper = node._child(".wo997_slides_wrapper");

	//const slider_container = node._parent();

	slider.slides_wrapper = slides_wrapper;

	/**
	 *
	 * @param {number} pos_x
	 * @param {number} pos_y
	 */
	const grab = (pos_x, pos_y) => {
		if (slider.grabbed_at_scroll !== undefined) {
			return;
		}
		slider.grabbed_at_scroll = slider.scroll;
		slider.input_x = pos_x;
		slider.last_input_x = pos_x;
		slider.grabbed_input_x = pos_x;
		slider.grabbed_input_y = pos_y;
		slider.just_released = false;
		slider.just_grabbed = true;
	};

	/**
	 *
	 * @param {number} pos_x
	 * @param {number} pos_y
	 */
	const scroll = (pos_x, pos_y) => {
		if (slider.grabbed_at_scroll === undefined) {
			return;
		}

		if (slider.just_grabbed) {
			slider.just_grabbed = false;

			if (IS_TOUCH_DEVICE) {
				const dx = Math.abs(pos_x - slider.grabbed_input_x);
				const dy = Math.abs(pos_y - slider.grabbed_input_y);

				if (dx < dy) {
					slider.release();
					return;
				}
			}
		}

		slider.input_x = pos_x;
	};

	slides_wrapper.addEventListener(
		"touchstart",
		(ev) => {
			const touch = ev.targetTouches[0];
			if (touch) {
				grab(touch.clientX, touch.clientY);
			}
		},
		{ passive: true }
	);

	slides_wrapper.addEventListener("touchmove", (ev) => {
		if (slider.grabbed_at_scroll === undefined) {
			return;
		}

		const touch = ev.targetTouches[0];
		if (touch) {
			scroll(touch.clientX, touch.clientY);
		}

		if (slider.grabbed_at_scroll !== undefined) {
			ev.preventDefault();
		}
	});

	slides_wrapper.addEventListener("mousedown", (ev) => {
		grab(ev.clientX, ev.clientY);
	});

	slides_wrapper.addEventListener("mousemove", (ev) => {
		scroll(ev.clientX, ev.clientY);
		let_click_slide = false;
	});

	// must be before arrows are created!
	if (node.dataset.has_slider_below !== undefined) {
		/** @type {PiepSliderNode} */
		// @ts-ignore
		const slider_below_node = node._next();
		if (slider_below_node) {
			slider_below_node._set_content(node.innerHTML);
			initSlider(slider_below_node);
			const slider_below = slider_below_node._slider;
			slider_below_node.classList.add("slider_below");

			node.addEventListener("slide_changed", (event) => {
				// @ts-ignore
				const detail = event.detail;
				const slide_id = detail.slide_id;

				slider_below.select_slide(slide_id);
			});

			slider_below_node._slider.slides_wrapper.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (!target) {
					return;
				}
				const slide = target._parent(".wo997_slide");
				if (!slide) {
					return;
				}
				const slide_id = +slide.dataset.slide_id;
				slider_below.release();
				slider_below.just_released = false; // lol
				slider_below.select_slide(slide_id);
				slider.set_slide(slide_id, { big_jump_duration: 0 });
			});
		}
	}

	node.insertAdjacentHTML(
		"beforeend",
		html`
			<div class="nav nav_prev">${ICONS.chevron_left}</div>
			<div class="nav nav_next">${ICONS.chevron_left}</div>
			<div class="pagination"></div>
		`
	);

	const pagination = node._child(".pagination");

	node.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const bullet = target._parent(".bullet");
		if (bullet) {
			slider.set_slide(+bullet.dataset.slide_id);
		}
	});

	const nav_prev = node._child(".nav_prev");
	const prev_svg = nav_prev._child("svg");

	const nav_next = node._child(".nav_next");
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
		slider.set_slide(slider.slide_id - slider.visible_slide_count);
		animate_nav(prev_svg);
	});
	nav_next.addEventListener("click", () => {
		slider.set_slide(slider.slide_id + slider.visible_slide_count);
		animate_nav(next_svg);
	});

	wo997_sliders.push(node);

	slider.release();
	slider.update();
	slider.set_slide(0);
}
