/* js[admin] */

/**
 *
 * @param {ShowModalParams} options
 */
function showAddProductModal(options = {}) {
	const ex = $("#addProductModal");
	if (!ex) {
		registerModalContent(html`
			<div id="addProductModal" data-dismissable data-expand>
				<div class="modal_body" style="max-width:400px;height: auto;">
					<div class="custom_toolbar">
						<span class="title medium">Dodaj produkt</span>
						<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
						<button class="btn primary add_btn ml1">Dodaj <i class="fas fa-check"></i></button>
					</div>
					<div class="scroll_panel scroll_shadow panel_padding">
						<div class="mtfn">
							<span class="label">Nazwa produktu</span>
							<input class="field product_name pretty_errors" data-validate="length:{3,}" />
						</div>
					</div>
				</div>
			</div>
		`);
	}
	showModal("addProductModal", options);

	$("#addProductModal .add_btn").addEventListener("click", () => {
		const errors = validateInputs($$("#addProductModal [data-validate]"));
		if (errors.length > 0) {
			return;
		}

		showLoader();
		xhr({
			url: STATIC_URLS["ADMIN"] + "/general_product/save",
			params: {
				general_product: {
					general_product_id: -1,
					name: $("#addProductModal .product_name")._get_value(),
					active: 0,
				},
			},
			success: (res) => {
				hideLoader();
				if (!res.general_product_id) {
					alert("Wystąpił błąd krytyczny");
					return;
				}

				window.location.href = `${STATIC_URLS["ADMIN"] + "/produkt/" + res.general_product_id}`;
			},
		});
	});
}
