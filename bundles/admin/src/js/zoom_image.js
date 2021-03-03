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
						<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
					</div>
					<div class="place flex_stretch" style="justify-content: center;align-items: center;"></div>
				</div>
			</div>
		`);
	}

	const place = $("#zoomImage .place");
	place._set_content(html`<img class="wo997_img" data-src="${src}" />`);
	/** @type {ResponsiveImage} */
	// @ts-ignore
	const wo997_img = place._child(".wo997_img");
	wo997_img.style.width = "10000px";
	loadImage(wo997_img);
	lazyLoadImages(false);
	wo997_img.style.width = "";

	showModal("zoomImage", params);
}
