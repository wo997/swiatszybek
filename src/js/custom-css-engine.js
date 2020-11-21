/* js[global] */

const MOBILE_WIDTH = 800;

window.addEventListener("resize", function () {
	resizeCallback();

	delay("resizeCallback", 200);
});
window.addEventListener("DOMContentLoaded", function () {
	resizeCallback();
});

// remember to switch back to regular responsive type, used in slider edit form
var forceMobile = false;

function getCustomSize(node, val) {
	if (val.charAt(val.length - 1) == "%") {
		return (
			Math.floor(
				($(node).parent().getBoundingClientRect().width * parseInt(val)) / 100 -
					0.5
			) + "px"
		);
	}
	return val;
}

function resizeCallback() {
	setCustomHeights();

	var responsiveType =
		forceMobile || window.innerWidth < MOBILE_WIDTH ? "mobile" : "desktop";

	$$(".cms-container").forEach((e) => {
		if (responsiveType == "desktop") {
			e.classList.toggle(
				"desktop-full-width",
				e.hasAttribute("data-desktop-full-width")
			);
		} else {
			e.classList.remove("desktop-full-width");
		}
	});

	var attribute = `data-${responsiveType}-width`;
	$$(`[${attribute}]`).forEach((e) => {
		e.style.width = e.getAttribute(attribute);
	});

	var attribute = `data-${responsiveType}-min-height`;
	$$(`[${attribute}]`).forEach((e) => {
		e.style.minHeight = getCustomSize(e, e.getAttribute(attribute));
	});

	for (let direction of ["Left", "Right", "Top", "Bottom"]) {
		for (let type of ["margin", "padding"]) {
			var attribute = `data-${type}_${direction.toLowerCase()}`;
			$$(`[${attribute}]`).forEach((e) => {
				if (e.classList.contains("removing")) {
					return;
				}
				var v = e.getAttribute(attribute);
				var jsstyle = type + direction;
				v = getCustomSize(e, v);

				if (
					["Top", "Bottom"].indexOf(direction) != -1 &&
					e.classList.contains("cms-container") &&
					findParentById(e, "actual_cms_wrapper")
				) {
					v = `calc(${v} + 10px)`;
				}

				e.style[jsstyle] = v;
			});
		}
	}

	var attribute = `data-${responsiveType}-justify-content`;
	$$(`[${attribute}]`).forEach((e) => {
		e.style.justifyContent = e.getAttribute(attribute);
	});

	var attribute = `data-${responsiveType}-align-items`;
	$$(`[${attribute}]`).forEach((e) => {
		e.style.alignItems = e.getAttribute(attribute);
	});

	var attribute = `data-${responsiveType}-flex-flow`;
	$$(`[${attribute}]`).forEach((e) => {
		e.style.flexFlow = e.getAttribute(attribute);
	});
}

function setCustomHeights() {
	$$("[data-height]").forEach((node) => {
		var height = node.getAttribute("data-height");
		if (height.indexOf("w") !== -1) {
			var r = node.getBoundingClientRect();

			if (!r.width) {
				return;
			}

			height = height.replace("w", "");
			var real_height = Math.floor(r.width * parseFloat(height));

			if (Math.abs(parseInt(r.height) - real_height) > 2) {
				node.style.height = `${real_height}px`;
			}
		} else {
			node.style.height = height;
		}
	});
}

function fixHeightsAutomatically() {
	setCustomHeights();
	setTimeout(fixHeightsAutomatically, 500);
}
fixHeightsAutomatically();

/* when modal is showed it has transform scale, so it causes that issue */
function setCustomHeightsQuickly(time = 30) {
	if (time < 0) {
		return;
	}
	setCustomHeights();
	requestAnimationFrame(() => {
		setCustomHeightsQuickly(time - 1);
	});
}
