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

let smooth_scrolling = false;
function smoothScroll(diff, params = {}) {
	if (smooth_scrolling) {
		return;
	}
	smooth_scrolling = true;

	/** @type {PiepNode} */
	params.scroll_parent = def(params.scroll_parent, document.documentElement);
	const scroll_parent = params.scroll_parent;
	const prodably_duration = def(params.duration, Math.sqrt(Math.abs(diff)));
	// duration is weird to be addde here,, but it's intentional

	const min_s = -scroll_parent.scrollTop;
	const max_s = scroll_parent.scrollHeight - scroll_parent.clientHeight - scroll_parent.scrollTop;
	diff = clamp(min_s - prodably_duration, diff, max_s + prodably_duration);
	params.duration = def(params.duration, 10 + 1 * Math.ceil(Math.sqrt(Math.abs(diff))));

	//console.log(diff);
	if (Math.abs(diff) < 2) {
		if (params.callback) {
			params.callback();
		}
		smooth_scrolling = false;
		return;
	}

	if (tooltip) {
		tooltip.dismiss();
	}

	params.t = 1;
	smoothScrolling(diff, params);
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
		smooth_scrolling = false;
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
 * @param {{duration?: number, offset?: number, margin?: number, callback?: CallableFunction}} params
 */
function scrollIntoView(elem, params = {}) {
	elem = $(elem);

	//const duration = def(params.duration, 40);
	const scroll_parent = elem._scroll_parent();
	const offset = def(params.offset, 0.15 * scroll_parent.offsetHeight);

	const elem_r = elem.getBoundingClientRect();
	const parent_r = scroll_parent.getBoundingClientRect();

	const top = elem_r.top - parent_r.top - offset;
	const bottom = elem_r.top + elem_r.height - (parent_r.top + parent_r.height - offset);

	let diff = 0;
	if (top < 0 && bottom > 0) {
		diff = top < -bottom ? top : bottom;
	} else if (top < 0) {
		diff = top;
	} else if (bottom > 0) {
		diff = bottom;
	}

	smoothScroll(diff, {
		callback: params.callback,
		scroll_parent: scroll_parent,
	});
}
