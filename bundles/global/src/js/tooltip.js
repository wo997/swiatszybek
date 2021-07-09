/* js[global] */

/**
 * @type {{
 * target: PiepNode
 * force_target?: PiepNode
 * dismiss()
 * resizeCallback()
 * last_target: PiepNode
 * }}
 */
let tooltip;
domload(() => {
	document.body.insertAdjacentHTML("beforeend", html`<div class="wo997tooltip ${root_class}" style="display:none"></div>`);
	tooltip = {
		target: $(".wo997tooltip"),
		dismiss: () => {
			var t = tooltip.target;
			t.style.display = "none";
			tooltip.last_target = null;
		},
		resizeCallback: () => {
			$$(".check_tooltip").forEach((e) => {
				e.classList.toggle("require-tooltip", e.offsetWidth < e.scrollWidth || e.scrollHeight > e.clientHeight);
			});
		},
		last_target: undefined,
	};

	// crazy shit lol
	const tacz = (event) => {
		const tltp = tooltip.target;

		const target = $(event.target);
		let e = tooltip.force_target ? tooltip.force_target : target._parent("[data-tooltip]");

		if (e && e.dataset.tooltip) {
			let tooltipText = e.dataset.tooltip;

			if (!tooltipText || e.matches("p-dropdown.dropped")) {
				return;
			}

			// !!! !!! !!! important !!! !!! !!!
			if (tooltipText === "html") {
				// a bit of not to trigger too often
				if (e.scrollWidth > e.offsetWidth + 3 || e.scrollHeight > e.clientHeight + 3) {
					tooltipText = e.innerHTML;
				} else {
					return;
				}
			}

			if (tooltip.last_target != e) {
				tltp.style.display = "block";
				tltp._set_content(tooltipText);
				tltp.style.animation = "show 0.15s";
			}

			const r = e.getBoundingClientRect();

			const offsetX = 3;
			const offsetY = 2;
			let left = r.left + offsetX + r.width * 0.5;
			let top = r.top + offsetY + r.height;

			const pos = e.dataset.tooltip_position;
			if (pos == "center") {
				left -= tltp.offsetWidth / 2 + offsetX;
			} else if (pos == "top") {
				left -= tltp.offsetWidth / 2 + offsetX;
				top -= r.height + tltp.offsetHeight + offsetY * 2;
			} else if (pos == "over") {
				left -= tltp.offsetWidth / 2 + offsetX;
				top -= 0.5 * (r.height + tltp.offsetHeight) + offsetY;
			} else if (pos == "right") {
				left += r.width / 2;
				top -= r.height / 2 + tltp.offsetHeight / 2 + offsetY;
			} else if (pos == "left") {
				left -= r.width / 2 + tltp.offsetWidth + offsetX * 2;
				top -= r.height / 2 + tltp.offsetHeight / 2 + offsetY;
			} else if (pos == "cursor") {
				left = mouse.pos.x + offsetX;
				top = mouse.pos.y + offsetY;
			}

			const maxLeft = window.innerWidth - 30 - tltp.offsetWidth;
			if (left > maxLeft) {
				left -= tltp.offsetWidth + offsetX * 2;
			}
			left = clamp(10, left, maxLeft);
			if (top < 10) {
				top = 10;
			}
			//const maxTop = window.innerHeight - trgt.offsetHeight - 10 - r.height;
			const maxTop = window.innerHeight - tltp.offsetHeight - 10;
			top = clamp(10, top, maxTop);

			tltp._set_absolute_pos(left, top);
		} else {
			tltp.style.display = "none";
		}

		tooltip.last_target = e;
	};
	window.addEventListener("mousemove", tacz, { passive: true });
	// window.addEventListener("touchstart", tacz, { passive: true });

	window.addEventListener("mousewheel", () => {
		tooltip.dismiss();
	});
	// window.addEventListener("touchmove", () => {
	// 	tooltip.dismiss();
	// });
	window.addEventListener("mousedown", (event) => {
		tooltip.dismiss();
	});

	window.addEventListener("resize", tooltip.resizeCallback);
	tooltip.resizeCallback();
});
