/* js[global] */

// add actual virtual height to css as a variable
function windowHeightResizeCallback() {
	let vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);
}
domload(windowHeightResizeCallback);
setTimeout(windowHeightResizeCallback);

window.addEventListener("resize", windowHeightResizeCallback);
window.addEventListener("touchend", windowHeightResizeCallback);
if (IS_TOUCH_DEVICE) {
	// important
	window.addEventListener("scroll", windowHeightResizeCallback);
}

function scrollFromTo(parent, diff, time, t = 0) {
	if (time < 2) {
		time = 2;
	}
	var d = (4 * diff * (time / 2 - Math.abs(time / 2 - t))) / (time * time);
	if (parent) {
		parent.scrollTop += d;
	} else window.scrollBy(0, d);

	if (t < time)
		window.requestAnimationFrame(function () {
			scrollFromTo(parent, diff, time, t + 1);
		});
}

let smooth_scrolling_parents = [];
function smoothScroll(diff, params = {}) {
	/** @type {PiepNode} */
	params.scroll_parent = def(params.scroll_parent, document.documentElement);

	if (smooth_scrolling_parents.includes(params.scroll_parent)) {
		return;
	}
	smooth_scrolling_parents.push(params.scroll_parent);

	const scroll_parent = params.scroll_parent;
	const prodably_duration = def(params.duration, Math.sqrt(Math.abs(diff)));
	// duration is weird to be addded here, but it's intentional

	const min_s = -scroll_parent.scrollTop;
	const max_s = scroll_parent.scrollHeight - scroll_parent.clientHeight - scroll_parent.scrollTop;
	diff = clamp(min_s - prodably_duration, diff, max_s + prodably_duration);
	params.duration = def(params.duration, 10 + 1 * Math.ceil(Math.sqrt(Math.abs(diff))));

	if (Math.abs(diff) < 2) {
		if (params.callback) {
			params.callback();
		}
		const ind = smooth_scrolling_parents.indexOf(params.scroll_parent);
		if (ind !== -1) {
			smooth_scrolling_parents.splice(ind);
		}
		return;
	}

	if (tooltip) {
		tooltip.dismiss();
	}

	params.t = 1;
	smoothScrolling(diff, params);

	return params.duration;
}

/**
 * Call smoothScroll instead
 */
function smoothScrolling(diff, params = {}) {
	const t = params.t;
	/** @type {PiepNode} */
	const scroll_parent = params.scroll_parent;
	const duration = params.duration;
	// duration is weird, but it's fine
	diff =
		t > 0
			? diff
			: clamp(
					-scroll_parent.scrollTop - duration,
					diff,
					scroll_parent.scrollHeight - scroll_parent.clientHeight - scroll_parent.scrollTop + duration
			  );

	if (t >= duration) {
		if (params.callback) {
			params.callback();
		}
		const ind = smooth_scrolling_parents.indexOf(params.scroll_parent);
		if (ind !== -1) {
			smooth_scrolling_parents.splice(ind);
		}
		return;
	}

	const pos = (x) => {
		if (x <= 0) {
			return 0;
		}
		if (x >= 1) {
			return 1;
		}
		if (x > 0.5) {
			return 1 - pos(1 - x);
		}
		//return Math.pow(x * 2, 2) / 2; // adjust however u want
		return x * x * 2;
	};

	scroll_parent.scrollBy(0, Math.round(diff * (pos((t + 1) / duration) - pos(t / duration))));

	requestAnimationFrame(() => {
		params.t = t + 1;
		smoothScrolling(diff, params);
	});
}

/**
 *
 * @param {PiepNode} elem
 * @param {{duration?: number, offset?: number, margin?: number, callback?: CallableFunction, direction?: "both" | "up" | "down"}} params
 */
function scrollIntoView(elem, params = {}) {
	if (!elem) {
		return;
	}
	elem = $(elem);

	//const duration = def(params.duration, 40);
	const scroll_parent = elem._scroll_parent();
	const is_main_scroll = scroll_parent === document.documentElement;
	const offset_height = is_main_scroll ? window.innerHeight : scroll_parent.offsetHeight;
	const offset = def(params.offset, 0.15 * offset_height);

	const elem_r = elem.getBoundingClientRect();
	const parent_r =
		scroll_parent === document.documentElement
			? { width: window.innerWidth, height: window.innerHeight, top: main_header_height ? header_height : 0, left: 0 }
			: scroll_parent.getBoundingClientRect();

	let top = elem_r.top - parent_r.top - offset;

	const bottom = elem_r.top + elem_r.height - (parent_r.top + parent_r.height - offset);

	let diff = 0;
	if (top < 0 && bottom > 0) {
		diff = top < -bottom ? top : bottom;
	} else if (top < 0) {
		diff = top;
	} else if (bottom > 0) {
		diff = bottom;
	}

	if ((params.direction === "up" && diff > 0) || (params.direction === "down" && diff < 0)) {
		if (params.callback) {
			params.callback();
		}
		return;
	}

	return smoothScroll(diff, {
		callback: params.callback,
		scroll_parent: scroll_parent,
	});
}

// prevent scroll below
const non_scrollables_selector = "#modal_wrapper, .float_menu, .headerbtn_menu";
const scrollables_selector =
	"#modal_wrapper .scroll_panel:not(.horizontal), .headerbtn_menu .scroll_panel:not(.horizontal), .separate_scroll, .separate_scroll_has_scroll";

// desktop
document.addEventListener(
	"mousewheel",
	(ev) => {
		if (!ev.cancelable) {
			return;
		}

		const target = $(ev.target);
		const node = target._parent(scrollables_selector);
		if (node) {
			if (node.classList.contains("separate_scroll_has_scroll")) {
				if (node.scrollHeight < node.offsetHeight + 1) {
					return;
				}
			}
			// @ts-ignore
			if ((ev.deltaY < 0 && node.scrollTop < 1) || (ev.deltaY > 0 && node.scrollTop > node.scrollHeight - node.offsetHeight - 1)) {
				ev.preventDefault();
			}
		} else if (target._parent(non_scrollables_selector)) {
			ev.preventDefault();
		}
	},
	{ passive: false, capture: true }
);

// mobile
let documentTouches;
document.addEventListener("touchstart", (ev) => {
	documentTouches = ev.targetTouches;
});
document.addEventListener(
	"touchmove",
	(ev) => {
		if (!ev.cancelable) {
			return;
		}

		const target = $(ev.target);
		const node = target._parent(scrollables_selector);
		if (node) {
			for (let i = 0; i < documentTouches.length; i++) {
				if (ev.targetTouches[i] && documentTouches[i]) {
					const dy = documentTouches[i].clientY - ev.targetTouches[i].clientY;
					if ((dy < 0 && node.scrollTop < 1) || (dy > 0 && node.scrollTop > node.scrollHeight - node.offsetHeight - 1)) {
						ev.preventDefault();
					}
				}
			}
		} else if (target._parent(non_scrollables_selector)) {
			ev.preventDefault();
		}
		documentTouches = ev.targetTouches;
	},
	{ passive: false, capture: true }
);
