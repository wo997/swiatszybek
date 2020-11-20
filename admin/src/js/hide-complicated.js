/* js[admin] */

var hide_complicated_btn = `<div class="btn secondary fas fa-tools complicated_btn" onclick='toggleComplicatedVisibility()' data-tooltip="Pokaż zaawansowane opcje"></div>`;

function toggleComplicatedVisibility(active = null) {
	if (active === null) {
		active = $(".complicated_btn").classList.contains("secondary");
	}

	var style_id = "complicated_btn_styles";
	if (active) {
		var x = $(`#${style_id}`);
		if (x) {
			x.remove();
		}
	} else {
		document.body.insertAdjacentHTML(
			"beforeend",
			`<style id="${style_id}">
          [data-complicated] {
              display: none !important;
          }
        </style>`
		);
	}
	$$(".complicated_btn").forEach((e) => {
		e.classList.toggle("primary", active);
		e.classList.toggle("secondary", !active);
	});
}

window.addEventListener("load", () => {
	toggleComplicatedVisibility(false);
});
