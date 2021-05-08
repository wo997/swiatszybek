/* js[admin] */

/**
 *
 * @param {string} src
 * @param {ShowModalParams} params
 */
function zoomImage(src, params = {}) {
	const ex = $("#zoomImage");
	if (!ex) {
		registerModalContent(html`
			<div id="zoomImage" data-dismissable>
				<div class="modal_body">
					<div class="custom_toolbar">
						<span class="title medium">Podgląd zdjęcia</span>
						<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
					</div>
					<div class="place flex_stretch align_center justify_center"></div>
				</div>
			</div>
		`);
	}

	const place = $("#zoomImage .place");
	place._set_content(html`<img class="wo997_img" data-src="${src}" data-resolution="df" />`);
	lazyLoadImages({ duration: 0 });

	showModal("zoomImage", params);
}
