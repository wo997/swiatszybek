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
							<div
								class="radio_group boxes pretty_blue hide_checks semi_bold inline_flex glue_children small_boxes select_resolution"
								style="margin-left:3px"
							>
								<div class="checkbox_area" data-tooltip="Komputer">
									<p-checkbox data-value=""></p-checkbox>
									<span> <i class="fas fa-desktop"></i> </span>
								</div>
								<div class="checkbox_area" data-tooltip="Tablet">
									<p-checkbox data-value="1024x768"></p-checkbox>
									<span> <i class="fas fa-mobile-alt"></i> </span>
								</div>
								<div class="checkbox_area" data-tooltip="Telefon">
									<p-checkbox data-value="414x896"></p-checkbox>
									<span> <i class="fas fa-mobile-alt"></i> </span>
								</div>
							</div>
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

		const select_resolution = $("#previewUrl .select_resolution");
		const iframe = $("#previewUrl iframe");

		select_resolution.addEventListener("change", () => {
			const [w, h] = select_resolution._get_value().split("x");
			iframe.style.maxWidth = w ? w + "px" : "";
			iframe.style.maxHeight = h ? h + "px" : "";
		});
	}

	$(`#previewUrl .preview_form`).setAttribute("action", url);
	$(`#previewUrl .preview_form [name="preview_params"]`)._set_value(JSON.stringify(params));
	showModal("previewUrl");
	// @ts-ignore
	$("#previewUrl .preview_form").submit();
}
