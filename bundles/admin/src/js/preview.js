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
							<span class="medium"> Podgląd strony </span>
							<div class="pretty_radio glue_children inline_flex semi_bold select_resolution ml1">
								<div class="checkbox_area" data-tooltip="Komputer">
									<p-checkbox data-value=""></p-checkbox>
									<span> <i class="fas fa-desktop"></i> </span>
								</div>
								<div class="checkbox_area" data-tooltip="Tablet">
									<p-checkbox data-value="1024x768"></p-checkbox>
									<span> <i class="fas fa-tablet-alt"></i> </span>
								</div>
								<div class="checkbox_area" data-tooltip="Telefon">
									<p-checkbox data-value="414x896"></p-checkbox>
									<span> <i class="fas fa-mobile-alt"></i> </span>
								</div>
							</div>
						</span>
						<a class="btn subtle ml1 open_btn mla" target="_blank">Pokaż <i class="fas fa-external-link-alt"></i></a
						><button class="btn primary ml1" onclick="hideParentModal(this)">Ukryj <i class="fas fa-times"></i></button>
					</div>
					<div class="flex_stretch">
						<iframe name="preview_iframe"></iframe>
					</div>
				</div>
				<form class="preview_form" method="post" target="preview_iframe">
					<input name="preview_params" />
				</form>
			</div>
		`);

		const preview_url = $("#previewUrl");
		const select_resolution = preview_url._child(".select_resolution");
		const iframe = preview_url._child("iframe");

		select_resolution.addEventListener("change", () => {
			const [w, h] = select_resolution._get_value().split("x");
			iframe.style.maxWidth = w ? w + "px" : "";
			iframe.style.maxHeight = h ? h + "px" : "";
		});

		select_resolution._set_value("");
	}

	$(`#previewUrl .open_btn`).href = url;
	$(`#previewUrl .preview_form`).setAttribute("action", url);
	$(`#previewUrl .preview_form [name="preview_params"]`)._set_value(JSON.stringify(params));
	showModal("previewUrl");
	// @ts-ignore
	$("#previewUrl .preview_form").submit();
}
