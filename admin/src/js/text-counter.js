/* js[admin] */

window.addEventListener("register-form-components", (ev) => {
	setTimeout(() => {
		// @ts-ignore
		registerTextCounters(ev.detail.parent);
	}, 0);
});

/**
 *
 * @param {PiepNode} parent
 */
function registerTextCounters(parent) {
	parent._children("[data-show-count]:not(.registered)").forEach((e) => {
		e.classList.add("registered");
		const changeCallback = () => {
			e._next()._child("span").innerHTML = e._get_value().length;
			if (e._get_value().length > e.getAttribute("data-show-count")) {
				e._next().style.color = "#f00";
				e._next().style.fontWeight = "bold";
			} else if (e._get_value().length > 0.9 * +e.getAttribute("data-show-count")) {
				e._next().style.color = "#fa0";
				e._next().style.fontWeight = "bold";
			} else {
				e._next().style.color = "#555";
				e._next().style.fontWeight = "";
			}
		};
		e.addEventListener("change", changeCallback);
		e.addEventListener("input", changeCallback);
		e.insertAdjacentHTML(
			"afterend",
			html`<div class="text-counter">
				<span></span><span> / ${e.getAttribute("data-show-count")} znaków ${def(e.getAttribute("data-count-description"))}</span>
			</div>`
		);
		changeCallback();
	});
}
