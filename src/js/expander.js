/* js[global] */

function mobileDrop(obj) {
	obj = obj._parent()._parent();
	if (obj.className == "") {
		obj.className = "mobile-drop";
	} else {
		obj.className = "";
	}
	return false;
}

function expandMenu(elem, btn, open = null, options = {}) {
	var expand_btn = btn._child(".expand_arrow");
	if (!expand_btn || !btn._next().classList.contains("expand_y")) {
		return;
	}

	var open = open
		? expand_btn.classList.toggle("open", open)
		: expand_btn.classList.toggle("open");
	var keyframes = "";
	if (open) {
		keyframes = `
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(90deg);
      }
    `;
	} else {
		keyframes = `
      0% {
        transform: rotate(90deg);
      }
      100% {
        transform: rotate(0deg);
      }
    `;
	}
	expand_btn._child(".fas")._animate(keyframes, def(options.duration, 200));

	btn.classList.toggle("open", expand(elem, open, options));

	if (options.single && open) {
		btn
			._parent()
			._children(".menu_item:not(.current-route) .expand_arrow.open")
			.forEach((e) => {
				if (e != expand_btn) {
					expandMenu(e._parent()._next(), e._parent());
				}
			});
	}
}

/**
 *
 * @param {PiepNode} elem
 * @param {boolean | undefined | null} show
 * @param {{
 * duration?: number
 * callback?: CallableFunction
 * }} options
 */
function expand(elem, show = null, options = {}) {
	if (!elem) {
		return;
	}
	if (show === null) {
		show = elem.classList.contains("hidden");
	}
	if (xor(show, elem.classList.contains("hidden"))) {
		return;
	}

	let animation_node = elem._direct_children().find((e) => {
		return e.classList.contains("expander_space");
	});
	if (!animation_node) {
		elem.insertAdjacentHTML("afterbegin", "<div class='expander_space'></div>");
		animation_node = elem._child(".expander_space");
		elem.insertAdjacentHTML("beforeend", "<div class='expander_space'></div>");
	}

	finishNodeAnimation(elem);
	finishNodeAnimation(animation_node);

	let duration =
		options.duration || options.duration === 0 ? options.duration : 250;
	let h = elem.scrollHeight;

	let h1 = (!show ? h : 0) + "px";
	let h2 = (show ? h : 0) + "px";

	let o1 = !show ? 1 : 0;
	let o2 = show ? 1 : 0;

	elem.classList.toggle("hidden", !show);
	elem.classList.add("animating");

	if (show) {
		elem.classList.remove("animate_hidden");
	}

	let m1 = (show ? -25 : 0) + "px";
	let m2 = (!show ? -25 : 0) + "px";

	animation_node._animate(
		`
            0% {
                margin-top: ${m1};
            }
            100% {
                margin-top: ${m2};
            }
        `,
		duration
	);

	elem._animate(
		`
            0% {
                height: ${h1};
                opacity: ${o1};
            }
            100% {
                height: ${h2};
                opacity: ${o2};
            }
        `,
		duration,
		{
			callback: () => {
				elem.style.height = show ? "" : "0px";

				if (!show) {
					elem.classList.add("animate_hidden");
				}
				elem.classList.remove("animating");

				if (options.callback) {
					options.callback();
				}
			},
		}
	);

	return show;
}

domload(() => {
	$$("nav a").forEach((a) => {
		const href = a.getAttribute("href");
		if (href == "/") {
			if (location.pathname == "/") {
				a.classList.add("current-route");
			}
		} else if (location.pathname.indexOf(href) === 0) {
			a.classList.add("current-route");
		} else if (location.href.indexOf(href) === 0) {
			a.classList.add("current-route");
		}
	});

	$$(".expandClick").forEach((e) => {
		e._child(".expandHeader").addEventListener("click", () => {
			e.classList.toggle("expanded");
		});
	});
});
