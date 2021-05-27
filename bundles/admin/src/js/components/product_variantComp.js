/* js[admin] */

/**
 * @typedef {{
 * product_variant_id: number
 * general_product_id: number
 * name: string
 * options: Product_VariantOptionCompData[]
 * pos?: number
 * common?: number
 * features?: Product_FeatureCompData[]
 * } & ListCompRowData} Product_VariantCompData
 *
 * @typedef {{
 * _data: Product_VariantCompData
 * _set_data(data?: Product_VariantCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  fill_options_btn: PiepNode
 *  add_option_btn: PiepNode
 * } & ListControlTraitNodes
 * _add_variant_option?(options?: {callback?()})
 * } & BaseComp} Product_VariantComp
 */

/** @type {Product_VariantComp} */
let currently_filling_product_variant_com;

/**
 * @param {Product_VariantComp} comp
 * @param {*} parent
 * @param {Product_VariantCompData} data
 */
function Product_VariantComp(comp, parent, data = { product_variant_id: -1, general_product_id: -1, name: "", options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			pass_list_data: [
				{ what: "features", where: "options" },
				{ what: "product_feature_option_ids", where: "options" },
			],
			...options,
			render: () => {
				comp._parent().classList.toggle("common_variant", !!data.common);
			},
		});
	};

	comp._add_variant_option = (options = {}) => {
		showLoader();

		xhr({
			url: STATIC_URLS["ADMIN"] + "/general_product/variant/option/save",
			params: {
				product_variant_option: {
					product_variant_id: comp._data.product_variant_id,
					name: "",
				},
			},
			success: (res) => {
				const product_variant_option = res.product_variant_option;
				comp._data.options.push({
					product_variant_option_id: product_variant_option.product_variant_option_id,
					product_variant_id: product_variant_option.product_variant_id,
					name: product_variant_option.name,
					selected_product_feature_options: [],
				});
				comp._render();
				hideLoader();

				// never used dude XD
				if (options.callback) {
					options.callback();
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="variant_header">
				<span class="semi_bold mr2" html="{${"Pole wyboru " + data.row_index + "."}}"></span>
				<input class="field small inline" data-bind="{${data.name}}" data-tooltip="Wpisz nazwę pola wyboru, np. Kolor" />
				<button data-node="{${comp._nodes.add_option_btn}}" class="btn {${data.options.length === 0}?important:primary} small ml2">
					Dodaj opcję <i class="fas fa-plus"></i>
				</button>

				<button
					data-node="{${comp._nodes.fill_options_btn}}"
					class="btn important small ml2 {${data.options.length}?hidden}"
					data-tooltip="Automatycznie uzupełnij opcje wariantu na podstawie wyżej zdefiniowanych cech"
				>
					Uzupełnij <i class="fas fa-pen"></i>
				</button>

				<div style="margin-left:auto">
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
			<list-comp data-bind="{${data.options}}" class="wireframe space" data-primary="product_variant_option_id">
				<product_variant-option-comp></product_variant-option-comp>
			</list-comp>
		`,

		initialize: () => {
			comp._nodes.add_option_btn.addEventListener("click", () => {
				comp._add_variant_option();
			});

			comp._nodes.fill_options_btn.addEventListener("click", () => {
				const fill = (fill_all = false) => {
					const data = currently_filling_product_variant_com._data;
					const feature_id = $("#fillVariantOptionsModal .choose_feature")._get_value();
					if (!feature_id) {
						showNotification("Wybierz cechę", { one_line: true, type: "error" });
						return;
					}

					/** @type {ProductComp} */
					// @ts-ignore
					const product_comp = $("product-comp");

					const feature = product_comp._data.features.find((feature) => feature.product_feature_id === feature_id);

					const product_variant_options = [];

					const add_more = feature.options.length - data.options.length;
					for (let i = 0; i < add_more; i++) {
						product_variant_options.push({
							product_variant_id: data.product_variant_id,
							name: "",
						});
					}

					showLoader();

					xhr({
						url: STATIC_URLS["ADMIN"] + "/general_product/variant/option/save_many",
						params: {
							product_variant_options,
						},
						success: (res) => {
							res.product_variant_options.forEach((product_variant_option) => {
								data.options.push({
									product_variant_option_id: product_variant_option.product_variant_option_id,
									product_variant_id: product_variant_option.product_variant_id,
									name: product_variant_option.name,
									selected_product_feature_options: [],
								});
							});

							data.options.forEach((option, index) => {
								const f_option = feature.options[index];
								// not everything is always correct in other components
								const warm_option = product_feature_options.find((e) => e.product_feature_option_id === f_option.product_feature_option_id);
								if (!warm_option) {
									return;
								}
								if (fill_all || option.selected_product_feature_options.length === 0) {
									option.selected_product_feature_options = [warm_option.product_feature_option_id];
								}
								if (fill_all || option.name.trim() === "") {
									option.name = warm_option.value;
								}
							});

							if (fill_all || data.name.trim() === "") {
								const feature_data = product_features.find((feature) => feature.product_feature_id === feature_id);
								data.name = feature_data.name;
							}

							if (fill_all) {
								data.options.splice(feature.options.length);
							}

							currently_filling_product_variant_com._render();
							hideLoader();
							hideModal("fillVariantOptionsModal");
						},
					});
				};

				const ex = $("#fillVariantOptionsModal");
				if (!ex) {
					registerModalContent(html`
						<div id="fillVariantOptionsModal" data-dismissable>
							<div class="modal_body">
								<div class="custom_toolbar">
									<span class="title medium">Uzupełnij opcje wariantu</span>
									<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
								</div>
								<div class="scroll_panel scroll_shadow panel_padding">
									<div class="label first">Na podstawie cechy</div>
									<div class="radio_group hide_checks choose_feature boxes columns_2 number"></div>

									<div style="display:flex;margin-top: auto;padding-top: 10px;text-align: right;">
										<!-- <button class="btn subtle fill fill_all" style="margin-right:10px">Nadpisz wszystko</button> -->
										<!-- <button class="btn primary fill fill_empty">Uzupełnij puste</button> -->
										<button class="btn primary fill fill_all">Uzupełnij</button>
									</div>
								</div>
							</div>
						</div>
					`);

					$("#fillVariantOptionsModal .fill_all").addEventListener("click", () => {
						fill(true);
					});

					// $("#fillVariantOptionsModal .fill_empty").addEventListener("click", () => {
					// 	fill(false);
					// });
				}
				let fill_options_html = "";
				comp._data.features.forEach((fea) => {
					const feature = product_features.find((f) => f.product_feature_id === fea.product_feature_id);
					const options = product_feature_options.filter((p) => p.product_feature_id === fea.product_feature_id);
					if (feature) {
						fill_options_html += html`
							<div class="checkbox_area" data-tooltip="${options.map((opt) => opt.value).join(", ")}">
								<p-checkbox data-value="${feature.product_feature_id}"></p-checkbox>
								<span>${feature.name}</span>
							</div>
						`;
					}
				});

				$("#fillVariantOptionsModal .choose_feature")._set_content(fill_options_html);

				currently_filling_product_variant_com = comp;
				showModal("fillVariantOptionsModal", { source: comp._nodes.fill_options_btn });
			});
		},
	});
}
