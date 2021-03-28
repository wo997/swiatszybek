/* js[admin] */

domload(() => {
	document.body.id = "admin";

	if (window.innerWidth < 800) {
		// hell no
		var nv = $(".navbar_admin");
		if (!nv) {
			return;
		}
		nv.classList.add("expand_y");
		nv.classList.add("hidden");
		nv.classList.add("animate_hidden");
		nv.insertAdjacentHTML(
			"beforebegin",
			html`
				<div class="btn subtle fill medium" onclick="expandMenu(this._next(),this)" style="flex-grow:0">
					<b>Menu</b>
					<div class="expand_arrow"><i class="fas fa-chevron-right"></i></div>
				</div>
			`
		);
	}
});

domload(() => {
	let exact = null;
	/** @type {PiepNode} */
	let shortest_hit = null;
	let shortest_length = 100000;
	$$(".navbar_admin .menu_item").forEach((e) => {
		var a = e._child("a");
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
			exact = e;
		}
	});

	if (exact) {
		shortest_hit = exact;
	}

	if (shortest_hit) {
		shortest_hit.classList.add("current-route");

		var parent_sub_menu = shortest_hit._parent(".sub_menu");
		if (parent_sub_menu) {
			expandMenu(parent_sub_menu, parent_sub_menu._prev(), null, {
				duration: 0,
			});
			parent_sub_menu._prev().classList.add("current-route");
		}

		var sub_menu = shortest_hit._next();
		if (sub_menu && sub_menu.classList.contains("sub_menu")) {
			expandMenu(sub_menu, sub_menu._prev(), null, {
				duration: 0,
			});
		}
	}
});
