/* js[user] */

domload(() => {
	/** @type {PiepNode} */
	let exact_hit = undefined;
	let exact_length = 100000;
	/** @type {PiepNode} */
	let shortest_hit = undefined;
	let shortest_length = 100000;
	$$(".user_nav > a").forEach((a) => {
		const href = a.getAttribute("href");

		if (location.pathname.indexOf(href) === 0 || location.href.indexOf(href) === 0) {
			if (href.length <= shortest_length) {
				shortest_hit = a;
				shortest_length = href.length;
			}
		}

		if (href && href.substr(0, location.pathname.length) == location.pathname) {
			if (href.length <= exact_length) {
				exact_hit = a;
				exact_length = href.length;
			}
		}
	});

	if (exact_hit) {
		shortest_hit = exact_hit;
	}

	if (shortest_hit) {
		shortest_hit.classList.add("current_route");
	}
});
