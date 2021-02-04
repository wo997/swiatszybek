/* js[global] */

let tooltip;
domload(() => {
	document.body.insertAdjacentHTML("beforeend", `<div class="wo997tooltip" style="display:none"></div>`);
	tooltip = {
		target: $(".wo997tooltip"),
		dismiss: () => {
			var t = tooltip.target;
			t.style.display = "none";
			tooltip.lastTooltipNode = null;
		},
		resizeCallback: () => {
			$$(".check-tooltip").forEach((e) => {
				e.classList.toggle("require-tooltip", e.offsetWidth < e.scrollWidth || e.scrollHeight > e.clientHeight);
			});
		},
	};

	// crazy shit lol
	document.addEventListener("pointermove", (event) => {
		var t = tooltip.target;

		const target = $(event.target);
		var e = target._parent("[data-tooltip]", { skip: 0 });
		if (e) {
			// && !e.hasAttribute("disabled")) {
			var tooltipText = e.dataset.tooltip;

			if (tooltipText === "") {
				if (e.offsetWidth < e.scrollWidth || e.scrollHeight > e.clientHeight) {
					tooltipText = e.innerHTML;
				} else {
					return;
				}
			}

			if (tooltip.lastTooltipNode != e) {
				t.style.display = "block";
				t.innerHTML = tooltipText;
				t.style.animation = "show 0.15s";
			}

			var nodeRect = e.getBoundingClientRect();
			var tooltipRect = t.getBoundingClientRect();

			var offsetX = 3;
			var offsetY = 2;
			var left = nodeRect.left + offsetX + nodeRect.width;
			var top = nodeRect.top + offsetY + nodeRect.height;

			var nodeRectPosition = e.getAttribute("data-tooltip-position");
			if (nodeRectPosition == "center") {
				left -= nodeRect.width / 2 + tooltipRect.width / 2 + offsetX;
			} else if (nodeRectPosition == "right") {
				top -= nodeRect.height / 2 + tooltipRect.height / 2 + offsetY;
			} else if (nodeRectPosition == "left") {
				top -= nodeRect.height / 2 + tooltipRect.height / 2 + offsetY;
				left -= nodeRect.width + tooltipRect.width + offsetX * 2;
			}

			var maxLeft = window.innerWidth - 30 - tooltipRect.width;
			if (left > maxLeft) {
				left -= tooltipRect.width + offsetX * 2 + nodeRect.width;
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
			var maxH = window.innerHeight - tooltipRect.height - 10;
			if (top > maxH) {
				top = maxH - nodeRect.height;
			}

			t.style.left = left + "px";
			t.style.top = top + "px";
		} else t.style.display = "none";

		tooltip.lastTooltipNode = e;
	});
	window.addEventListener("mousewheel", () => {
		tooltip.dismiss();
	});
	window.addEventListener("mousedown", (event) => {
		// click could be prevented lol
		tooltip.dismiss();
		/*if (!event.target._parent(tooltip.lastTooltipNode)) {
			tooltip.dismiss();
		} else {
			if (tooltip.lastTooltipNode.hasAttribute("data-tooltip-hide")) {
				tooltip.dismiss();
			}
		}*/
	});

	window.addEventListener("resize", tooltip.resizeCallback);
	tooltip.resizeCallback();
});
