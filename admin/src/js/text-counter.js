/* js[admin] */

window.addEventListener("register-form-components", () => {
	setTimeout(() => {
		registerTextCounters();
	}, 0);
});

function registerTextCounters() {
	$$("[data-show-count]:not(.registered)").forEach((e) => {
		e.classList.add("registered");
		const changeCallback = () => {
			e._next().find("span").innerHTML = e.value.length;
			if (e.value.length > e.getAttribute("data-show-count")) {
				e._next().style.color = "#f00";
				e._next().style.fontWeight = "bold";
			} else if (e.value.length > 0.9 * e.getAttribute("data-show-count")) {
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
			`
            <div class='text-counter'>
              <span></span><span> / ${e.getAttribute(
								"data-show-count"
							)} znaków ${def(e.getAttribute("data-count-description"))}</span>
            </div>
        `
		);
		changeCallback();
	});
}
