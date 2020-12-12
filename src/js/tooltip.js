/* js[global] */
domload(() => {
	document.body.insertAdjacentHTML(
		"beforeend",
		`<div class="wo997tooltip" style="display:none"></div>`
	);
	window.tooltip = {
		target: $(".wo997tooltip"),
		dismiss: () => {
			var t = window.tooltip.target;
			t.style.display = "none";
			window.tooltip.lastTooltipNode = null;
		},
		resizeCallback: () => {
			$$(".check-tooltip").forEach((e) => {
				e.classList.toggle(
					"require-tooltip",
					e.offsetWidth < e.scrollWidth || e.scrollHeight > e.clientHeight
				);
			});
		},
	};

	window.addEventListener("mousemove", function (event) {
		var t = window.tooltip.target;
		var e = findParentByAttribute(event.target, "data-tooltip");
		if (e && !e.hasAttribute("disabled")) {
			var tooltipText = e.getAttribute("data-tooltip");

			if (tooltipText === "") {
				if (e.offsetWidth < e.scrollWidth || e.scrollHeight > e.clientHeight) {
					tooltipText = e.innerHTML;
				} else {
					return;
				}
			}

			if (window.tooltip.lastTooltipNode != e) {
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

			var nodeRectPosition = e.getAttribute("data-position");
			if (nodeRectPosition == "center") {
				left -= nodeRect.width / 2 + tooltipRect.width / 2 + offsetX;
			} else if (nodeRectPosition == "right") {
				top -= nodeRect.height / 2 + tooltipRect.height / 2 + offsetY;
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

		window.tooltip.lastTooltipNode = e;
	});
	window.addEventListener("mousewheel", () => {
		window.tooltip.dismiss();
	});
	window.addEventListener("click", (event) => {
		if (!event.target.findParentNode(window.tooltip.lastTooltipNode)) {
			window.tooltip.dismiss();
		}
	});

	window.addEventListener("resize", window.tooltip.resizeCallback);
	window.tooltip.resizeCallback();
});
