/* js[admin] */

/**
 *
 * @param {string} url
 * @param {any} url
 */
function previewUrl(url, params) {
	const ex = $("#previewUrl");
	if (!ex) {
		registerModalContent(html`
			<div id="previewUrl" data-modal data-expand="large">
				<div class="modal_body">
					<div class="custom_toolbar">
						<span class="title">
							Podgląd strony
							<button class="btn primary" data-size="">Komputer <i class="fas fa-desktop"></i></button>
							<button class="btn primary" data-size="410x850">Telefon <i class="fas fa-mobile-alt"></i></button>
							<button class="btn primary" data-size="340x568">
								iPhone SE <i class="fas fa-mobile-alt"></i>
								<i class="fas fa-info-circle" data-tooltip="Najmniejsza rozdzielczość z urządzeń mobilnych"></i>
							</button>
						</span>
						<button class="btn primary" onclick="hideParentModal(this)">Ukryj <i class="fas fa-times"></i></button>
					</div>
					<div class="flex_stretch">
						<iframe name="preview_iframe"></iframe>
					</div>
				</div>
				<form class="preview_form" method="post" target="preview_iframe">
					<input type="text" name="preview_params" />
				</form>
			</div>
		`);
	}

	$(`#previewUrl .preview_form`).setAttribute("action", url);
	$(`#previewUrl .preview_form [name="preview_params"]`)._set_value(JSON.stringify(params));
	showModal("previewUrl");
	// @ts-ignore
	$("#previewUrl .preview_form").submit();
}
