/* js[admin] */

domload(() => {
	//document.body.id = "admin";

	const navbar_admin = $(".navbar_admin");
	const is_mobile = () => {
		return window.innerWidth < 1000;
	};
	let first_mob = true;
	const resize = () => {
		const mobile = is_mobile();
		navbar_admin.classList.toggle("expand_y", mobile);

		if (!mobile) {
			navbar_admin.classList.remove("hidden", "animate_hidden");
		} else {
			if (first_mob) {
				first_mob = false;
				navbar_admin.classList.add("hidden", "animate_hidden");
			}
		}
	};
	window.addEventListener("resize", resize);
	resize();

	$(".menu_btn").addEventListener("click", () => {
		const open = $("header.mobile").classList.toggle("open");
		expand(navbar_admin, open);
	});
});

domload(() => {
	/** @type {PiepNode} */
	let exact_hit = undefined;
	let exact_length = 100000;
	/** @type {PiepNode} */
	let shortest_hit = undefined;
	let shortest_length = 100000;
	$$(".navbar_admin .menu_item").forEach((e) => {
		const a = e._child("a");
		if (!a) {
			return;
		}
		const href = a.getAttribute("href");

		if (location.pathname.indexOf(href) === 0 || location.href.indexOf(href) === 0) {
			if (href.length <= shortest_length) {
				shortest_hit = e;
				shortest_length = href.length;
			}
		}

		if (href && href.substr(0, location.pathname.length) == location.pathname) {
			if (href.length <= exact_length) {
				exact_hit = e;
				exact_length = href.length;
			}
		}
	});

	if (exact_hit) {
		shortest_hit = exact_hit;
	}

	if (shortest_hit) {
		shortest_hit.classList.add("current_route");

		const parent_sub_menu = shortest_hit._parent(".sub_menu");
		if (parent_sub_menu) {
			expandMenu(parent_sub_menu, parent_sub_menu._prev(), null, {
				duration: 0,
			});
			parent_sub_menu._prev().classList.add("current_route");
		}

		const sub_menu = shortest_hit._next();
		if (sub_menu && sub_menu.classList.contains("sub_menu")) {
			expandMenu(sub_menu, sub_menu._prev(), null, {
				duration: 0,
			});
		}
	}
});
