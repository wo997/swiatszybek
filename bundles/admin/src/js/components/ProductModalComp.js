/* js[admin] */

/**
 * @typedef {{
 * } & DtProductData} ProductModalCompData
 *
 * @typedef {{
 * _data: ProductModalCompData
 * _set_data(data?: ProductModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  save_btn: PiepNode
 *  delete_btn: PiepNode
 * }
 * _show?(product_data: DtProductData, options?: ShowModalParams)
 * } & BaseComp} ProductModalComp
 */

/**
 * @param {ProductModalComp} comp
 * @param {*} parent
 * @param {ProductModalCompData} data
 */
function ProductModalComp(comp, parent, data = undefined) {
	/** @type {ProductModalCompData} */
	const defa = {
		product_id: -1,
		active: 1,
		gross_price: 0,
		height: 0,
		length: 0,
		net_price: 0,
		stock: 0,
		vat_id: undefined,
		weight: 0,
		width: 0,
		img_url: "",
		name: "",
		__img_url: "",
		__name: "",
	};
	if (data === undefined) {
		data = defa;
	}

	comp._show = (product_data, options = {}) => {
		if (product_data === undefined) {
			comp._data = defa;
		} else {
			comp._data = product_data;
		}

		const data = comp._data;

		comp._child(".case_general_product").classList.toggle("hidden", !data.general_product_id);
		comp._child(".case_just_product").classList.toggle("hidden", !!data.general_product_id);

		if (!data.general_product_id) {
			if (!data.img_url) {
				data.img_url = data.__img_url;
			}
			if (!data.name) {
				data.name = data.__name;
			}
		}

		comp._render();

		showModal("ProductModal", {
			source: options.source,
		});
	};

	comp._set_data = (data, options = {}) => {
		let vat = vats.find((e) => e.vat_id === data.vat_id);
		if (!vat) {
			const default_vat = vats[0];
			if (default_vat) {
				data.vat_id = default_vat.vat_id;
				vat = vats.find((e) => e.vat_id === data.vat_id);
			}
		}

		const active_element = $(document.activeElement);
		if (active_element && active_element.dataset) {
			const key = active_element.dataset.bind;
			if (["net_price", "gross_price", "vat_id"].includes(key)) {
				const vat = vats.find((e) => e.vat_id === data.vat_id);
				const vat_val = vat ? vat.value : 0;
				data.gross_price = round(data.gross_price, 2);
				data.net_price = round(data.net_price, 2);
				let set_what = "";
				if (key === "vat_id") {
					// anything to rewrite?
					if (numberFromStr(data.gross_price + "")) {
						set_what = "net_price";
					} else if (numberFromStr(data.net_price + "")) {
						set_what = "gross_price";
					}
				} else {
					if (key === "gross_price") {
						set_what = "net_price";
					} else if (key === "net_price") {
						set_what = "gross_price";
					}
				}
				if (set_what === "net_price") {
					data.net_price = round(data.gross_price / (1 + vat_val), 2);
				} else if (set_what === "gross_price") {
					data.gross_price = round(data.net_price * (1 + vat_val), 2);
				}
			}
		}

		const vat_val = vat ? vat.value : 0;
		data.net_price = round(data.gross_price / (1 + vat_val), 2);

		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="custom_toolbar">
				<span class="title medium mr2">Produkt</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn" style="max-width: 500px;">
					<div class="case_general_product">
						<div class="disabled_container mtf pa2">
							<div class="label mt0">Nazwa produktu w sklepie</div>
							<input class="field" data-bind="{${data.__name}}" />

							<div class="label">Zdjęcie produktu w sklepie</div>
							<image-picker class="field" data-bind="{${data.__img_url}}" style="width: 120px;height: 120px;"> </image-picker>
						</div>
						<div class="striped_container mtf pa2">
							<div class="label mt0">Nazwa (Jeśli inna niż domyślna)</div>
							<input class="field" data-bind="{${data.name}}" />

							<div class="label">Zdjęcie (Jeśli inne niż domyślne)</div>
							<image-picker class="field" data-bind="{${data.img_url}}" style="width: 120px;height: 120px;"> </image-picker>
						</div>
					</div>

					<div class="case_just_product">
						<div class="user_info mtf">
							Produkt nie jest dostępny w sklepie
							<div class="hover_info">
								Aby dodać produkt do sklepu w pierwszej kolejności utwórz "produkt w sklepie" i uzupełnij wszystkie dane, a następnie w
								tabeli wszystkich produktów powiąż ten produkt.
							</div>
						</div>

						<div class="label">Nazwa</div>
						<input class="field" data-bind="{${data.name}}" />

						<div class="label">Zdjęcie</div>
						<image-picker class="field" data-bind="{${data.img_url}}" style="width: 120px;height: 120px;"> </image-picker>
					</div>

					<div class="desktop_row">
						<div>
							<div class="label">Cena Netto</div>
							<div class="glue_children">
								<input class="field number" data-bind="{${data.net_price}}" />
								<div class="field_desc">zł</div>
							</div>
						</div>

						<div>
							<div class="label">VAT</div>
							<select class="field number" data-bind="{${data.vat_id}}">
								${vats.map((v) => html`<option value="${v.vat_id}">${v.value * 100}%</option>`).join("")}
							</select>
						</div>

						<div>
							<div class="label">Cena Brutto</div>
							<div class="glue_children">
								<input class="field number" data-bind="{${data.gross_price}}" />
								<div class="field_desc">zł</div>
							</div>
						</div>
					</div>

					<div class="label">Waga</div>
					<div class="glue_children">
						<input class="field number" data-bind="{${data.weight}}" />
						<div class="field_desc">g</div>
					</div>

					<div class="desktop_row">
						<div>
							<div class="label">Długość</div>
							<div class="glue_children">
								<input class="field number" data-bind="{${data.length}}" />
								<div class="field_desc">cm</div>
							</div>
						</div>

						<div>
							<div class="label">Szerokość</div>
							<div class="glue_children">
								<input class="field number" data-bind="{${data.width}}" />
								<div class="field_desc">cm</div>
							</div>
						</div>

						<div>
							<div class="label">Wysokość</div>
							<div class="glue_children">
								<input class="field number" data-bind="{${data.height}}" />
								<div class="field_desc">cm</div>
							</div>
						</div>
					</div>
				</div>

				<div class="mta pt2 case_can_delete" style="text-align: right;">
					<button class="btn error" disabled data-node="{${comp._nodes.delete_btn}}">Usuń produkt <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const data = comp._data;
				const errors = validateInputs(comp._children("[data-validate]").filter((e) => !e._parent(".hidden")));
				if (errors.length > 0) {
					return;
				}

				const product = {
					product_id: data.product_id,
					//active: data.active,
					gross_price: data.gross_price,
					height: data.height,
					length: data.length,
					net_price: data.net_price,
					//stock: data.stock,
					vat_id: data.vat_id,
					weight: data.weight,
					width: data.width,
					img_url: data.img_url,
					name: data.name,
				};

				showLoader();
				xhr({
					url: STATIC_URLS["ADMIN"] + "/product/save",
					params: {
						product,
					},
					success: (res) => {
						hideLoader();
						window.dispatchEvent(new CustomEvent("products_changed"));
						hideModal("ProductModal");
					},
				});
			});

			// comp._nodes.delete_btn.addEventListener("click", () => {
			// 	if (!confirm("Czy aby na pewno chcesz usunąć produkt?")) {
			// 		return;
			// 	}

			// 	showLoader();
			// 	xhr({
			// 		url: `${STATIC_URLS["ADMIN"]}/product/delete/${comp._data.product_id}`,
			// 		success: (res) => {
			// 			hideLoader();
			// 			//refreshProducts();
			// 			hideModal("ProductModal");
			// 		},
			// 	});
			// });
		},
	});
}

function getProductModal() {
	const ex = $("#ProductModal");
	if (!ex) {
		registerModalContent(html`
			<div id="ProductModal" data-dismissable>
				<div class="modal_body">
					<product-modal-comp class="flex_stretch"></product-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {ProductModalComp} */
	// @ts-ignore
	const product_modal_comp = $("#ProductModal product-modal-comp");
	if (!ex) {
		ProductModalComp(product_modal_comp, undefined);
	}
	return product_modal_comp;
}
