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

function smoothScroll(diff, params = {}) {
	const t = def(params.t, 0);
	/** @type {PiepNode} */
	const scroll_parent = def(params.scroll_parent, window);
	const duration = def(params.duration, 10 + 1 * Math.ceil(Math.sqrt(Math.abs(diff))));
	// duration is weird, but it's fine
	diff =
		t > 0
			? diff
			: clamp(
					-scroll_parent.scrollTop - duration,
					diff,
					scroll_parent.scrollHeight - scroll_parent.clientHeight - scroll_parent.scrollTop + duration
			  );

	scroll_parent.scrollBy(0, (4 * diff * (duration / 2 - Math.abs(duration / 2 - t))) / (duration * duration));

	if (t == 0 && tooltip && Math.abs(diff) > 5) {
		tooltip.dismiss();
	}

	if (t >= duration) {
		params.callback();
		return;
	}

	requestAnimationFrame(() => {
		params.t = t + 1;
		smoothScroll(diff, params);
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
