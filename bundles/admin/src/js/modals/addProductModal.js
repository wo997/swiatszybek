/* js[admin] */

function showAddProductModal() {
	const ex = $("#addProductModal");
	if (!ex) {
		registerModalContent(html`
			<div id="addProductModal" data-dismissable data-expand>
				<div class="modal_body" style="max-width:400px;height: auto;">
					<div class="custom_toolbar">
						<span class="title medium">Dodaj produkt</span>
						<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
					</div>
					<div class="scroll_panel scroll_shadow panel_padding">
						<span class="label first">Nazwa produktu</span>
						<input class="field product_name pretty_errors" data-validate="length:{3,}" />

						<button class="btn primary mtf add_btn">Dodaj <i class="fas fa-plus"></i></button>
					</div>
				</div>
			</div>
		`);
	}
	showModal("addProductModal");

	$("#addProductModal .add_btn").addEventListener("click", () => {
		const errors = validateInputs($$("#addProductModal [data-validate]"));
		if (errors.length > 0) {
			return;
		}

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
				if (!res.general_product_id) {
					alert("Wystąpił błąd krytyczny");
				}

				window.location.href = `${STATIC_URLS["ADMIN"] + "/produkt/" + res.general_product_id}`;
			},
		});
	});
}
