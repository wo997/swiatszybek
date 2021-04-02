/* js[global] */

/**
 * @type {{
 * target: PiepNode,
 * dismiss()
 * resizeCallback()
 * last_target: PiepNode
 * }}
 */
let tooltip;
domload(() => {
	document.body.insertAdjacentHTML("beforeend", html`<div class="wo997tooltip" style="display:none"></div>`);
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
		const t = tooltip.target;

		const target = $(event.target);
		const e = target._parent("[data-tooltip]");
		if (e) {
			let tooltipText = e.dataset.tooltip;

			if (!tooltipText || e.matches("p-dropdown.dropped")) {
				return;
			}

			// !!! !!! !!! important !!! !!! !!!
			if (tooltipText === "html") {
				if (e.scrollWidth > e.offsetWidth || e.scrollHeight > e.clientHeight) {
					tooltipText = e.innerHTML;
				} else {
					return;
				}
			}

			if (tooltip.last_target != e) {
				t.style.display = "block";
				t._set_content(tooltipText);
				t.style.animation = "show 0.15s";
			}

			const nodeRect = e.getBoundingClientRect();
			const tooltipRect = t.getBoundingClientRect();

			const offsetX = 3;
			const offsetY = 2;
			let left = nodeRect.left + offsetX + nodeRect.width * 0.5;
			let top = nodeRect.top + offsetY + nodeRect.height;

			const nodeRectPosition = e.dataset.tooltip_position;
			if (nodeRectPosition == "center") {
				left -= tooltipRect.width / 2 + offsetX;
			} else if (nodeRectPosition == "right") {
				top -= nodeRect.height / 2 + tooltipRect.height / 2 + offsetY;
				left += nodeRect.width / 2;
			} else if (nodeRectPosition == "left") {
				top -= nodeRect.height / 2 + tooltipRect.height / 2 + offsetY;
				left -= nodeRect.width / 2 + tooltipRect.width + offsetX * 2;
			}

			const maxLeft = window.innerWidth - 30 - tooltipRect.width;
			if (left > maxLeft) {
				left -= tooltipRect.width + offsetX * 2; // + nodeRect.width;
			}
			if (left > maxLeft) {
				left = maxLeft;
			}
			if (left < 10) {
				left = 10;
			}

			if (top < 10) {
				top = 10;
			}
			const maxH = window.innerHeight - tooltipRect.height - 10;
			if (top > maxH) {
				top = maxH - nodeRect.height;
			}

			t.style.left = left + "px";
			t.style.top = top + "px";
		} else t.style.display = "none";

		tooltip.last_target = e;
	};
	window.addEventListener("mousemove", tacz);
	window.addEventListener("touchstart", tacz);

	window.addEventListener("mousewheel", () => {
		tooltip.dismiss();
	});
	window.addEventListener("touchmove", () => {
		tooltip.dismiss();
	});
	window.addEventListener("mousedown", (event) => {
		// click could be prevented lol
		tooltip.dismiss();
		/*if (!event.target._parent(tooltip.last_target)) {
			tooltip.dismiss();
		} else {
			if (tooltip.last_target.hasAttribute("data-tooltip-hide")) {
				tooltip.dismiss();
			}
		}*/
	});

	window.addEventListener("resize", tooltip.resizeCallback);
	tooltip.resizeCallback();
});
