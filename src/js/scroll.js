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
	var duration = def(params.duration, 40);
	var t = def(params.t, 0);

	var scroll_parent = def(params.scroll_parent, window);

	scroll_parent.scrollBy(
		0,
		(4 * diff * (duration / 2 - Math.abs(duration / 2 - t))) /
			(duration * duration)
	);

	if (t == 0 && tooltip && Math.abs(diff) > 5) {
		tooltip.dismiss();
	}

	if (t < duration) {
		requestAnimationFrame(() => {
			params.t = t + 1;
			smoothScroll(diff, params);
		});
	} else if (params.callback) {
		params.callback();
	}
}

function scrollIntoView(elem, params = {}) {
	elem = $(elem);
	var duration = def(params.duration, 40);
	var offset = def(params.offset, 0);
	var margin = def(params.margin, 0.2);

	var r = elem.getBoundingClientRect();
	if (r.left == 0) {
		elem = elem._parent();
		r = elem.getBoundingClientRect();
	}

	var top = r.top + offset;
	var bottom = r.top + r.height + offset;

	var topMin = window.innerHeight * margin;
	var bottomMin = window.innerHeight * (1 - margin);

	var diff = 0;

	if (top < topMin) {
		diff = top - topMin;
	} else if (bottom > bottomMin) {
		diff = bottom - bottomMin;
	}

	var scroll_parent = elem._find_scroll_parent();

	smoothScroll(diff, {
		duration: duration,
		callback: params.callback,
		scroll_parent: scroll_parent,
	});
}
