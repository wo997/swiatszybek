/* js[admin] */

/**
 * @typedef {{
 * product_feature_id: number
 * options: Product_FeatureOptionCompData[]
 * data_type: string
 * physical_measure: string
 * } & ListCompRowData} Product_FeatureCompData
 *
 * @typedef {{
 * _data: Product_FeatureCompData
 * _set_data(data?: Product_FeatureCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  feature_name: PiepNode
 *  edit_feature_btn: PiepNode
 *  add_option_btn: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureComp
 */

/**
 * @param {Product_FeatureComp} comp
 * @param {*} parent
 * @param {Product_FeatureCompData} data
 */
function Product_FeatureComp(
	comp,
	parent,
	data = { product_feature_id: -1, options: [], data_type: "text_list", physical_measure: "none" }
) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			pass_list_data: [
				{ what: "product_feature_id", where: "options" },
				{ what: "data_type", where: "options" },
				{ what: "physical_measure", where: "options" },
			],
			render: () => {
				const feature = product_features.find((e) => e.product_feature_id === data.product_feature_id);
				if (feature) {
					comp._nodes.feature_name._set_content(`${data.row_index + 1}. ${feature.name}`);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="variant_header">
				<div class="title inline semi_bold" data-node="{${comp._nodes.feature_name}}"></div>
				<button data-node="{${comp._nodes.add_option_btn}}" class="btn {${data.options.length === 0}?important:primary} small ml1">
					Dodaj opcje <i class="fas fa-plus"></i>
				</button>

				<div class="mla pl2">
					<button data-node="{${comp._nodes.edit_feature_btn}}" class="btn subtle small" data-tooltip="Edytuj cechę produktu">
						<i class="fas fa-cog"></i>
					</button>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>

			<list-comp data-bind="{${data.options}}" class="wireframe space" data-primary="product_feature_option_id">
				<product_feature-option-comp></product_feature-option-comp>
			</list-comp>
		`,
		initialize: () => {
			const product_feature_modal_comp = getProductFeatureModal();

			comp._nodes.edit_feature_btn.addEventListener("click", () => {
				product_feature_modal_comp._show(comp._data.product_feature_id, { source: comp._nodes.edit_feature_btn });
			});

			/** @type {ListComp} */
			// @ts-ignore
			const list = comp._parent_comp;

			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = list._parent_comp;

			comp._nodes.add_option_btn.addEventListener("click", () => {
				if (comp._data.data_type.endsWith("_list")) {
					const select_product_features_options_modal_comp = getSelectProductFeatureOptionsModal();
					select_product_features_options_modal_comp._show(comp._data.product_feature_id, {
						source: comp._nodes.add_option_btn,
					});
				} else {
					showLoader();

					/** @type {Product_FeatureOptionCompData} */
					const product_feature_option = {
						product_feature_id: comp._data.product_feature_id,
						product_feature_option_id: -1,
						just_general_product_id: product_comp._data.general_product_id,
					};

					xhr({
						url: STATIC_URLS["ADMIN"] + "/product/feature/option/save",
						params: {
							product_feature_option,
						},
						success: (res) => {
							product_comp._data.product_feature_option_ids.push(res.product_feature_option.product_feature_option_id);
							refreshProductFeatures();
						},
					});
				}
			});

			list.addEventListener("remove_row", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				if (detail.res.removed || !comp._data) {
					return;
				}

				if (detail.row_index !== comp._data.row_index) {
					return;
				}

				detail.res.removed = true;

				const pfi = product_comp._data.product_feature_ids;
				const id = pfi.indexOf(comp._data.product_feature_id);
				if (id !== -1) {
					pfi.splice(id, 1);
				}
				product_comp._render();
			});

			list.addEventListener("move_row", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				let from = detail.from;
				if (detail.res.moved || !comp._data) {
					return;
				}

				if (from !== comp._data.row_index) {
					return;
				}
				let to = detail.to;

				detail.res.moved = true;

				const pfi = product_comp._data.product_feature_ids;
				const id = pfi.indexOf(comp._data.product_feature_id);
				if (id !== -1) {
					from = clamp(0, from, pfi.length - 1);
					to = clamp(0, to, pfi.length - 1);

					const temp = pfi.splice(from, 1);
					pfi.splice(to, 0, ...temp);
				}
				product_comp._render();
			});

			window.addEventListener("product_features_changed", () => {
				hideLoader();
			});
		},
	});
}
