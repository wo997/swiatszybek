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
				tltp.style.display = "block";
				tltp._set_content(tooltipText);
				tltp.style.animation = "show 0.15s";
			}

			const nodeRect = e.getBoundingClientRect();

			const offsetX = 3;
			const offsetY = 2;
			let left = nodeRect.left + offsetX + nodeRect.width * 0.5;
			let top = nodeRect.top + offsetY + nodeRect.height;

			const nodeRectPosition = e.dataset.tooltip_position;
			if (nodeRectPosition == "center") {
				left -= tltp.offsetWidth / 2 + offsetX;
			} else if (nodeRectPosition == "top") {
				left -= tltp.offsetWidth / 2 + offsetX;
				top -= nodeRect.height + tltp.offsetHeight + offsetY * 2;
			} else if (nodeRectPosition == "over") {
				left -= tltp.offsetWidth / 2 + offsetX;
				top -= 0.5 * (nodeRect.height + tltp.offsetHeight) + offsetY;
			} else if (nodeRectPosition == "right") {
				top -= nodeRect.height / 2 + tltp.offsetHeight / 2 + offsetY;
				left += nodeRect.width / 2;
			} else if (nodeRectPosition == "left") {
				top -= nodeRect.height / 2 + tltp.offsetHeight / 2 + offsetY;
				left -= nodeRect.width / 2 + tltp.offsetWidth + offsetX * 2;
			}

			const maxLeft = window.innerWidth - 30 - tltp.offsetWidth;
			if (left > maxLeft) {
				left -= tltp.offsetWidth + offsetX * 2; // + nodeRect.width;
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
			const maxH = window.innerHeight - tltp.offsetHeight - 10;
			if (top > maxH) {
				top = maxH - nodeRect.height;
			}

			tltp.style.left = left + "px";
			tltp.style.top = top + "px";
		} else {
			tltp.style.display = "none";
		}

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
