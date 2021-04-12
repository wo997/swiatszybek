/* js[admin] */

/**
 * @typedef {{
 * product_variant_option_id: number
 * product_variant_id: number
 * name: string
 * pos?: number
 * product_feature_options: number[]
 * features?: Product_FeatureCompData[]
 * } & ListCompRowData} Product_VariantOptionCompData
 *
 * @typedef {{
 * _data: Product_VariantOptionCompData
 * _set_data(data?: Product_VariantOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  select_options: PiepNode
 *  selected_options: PiepNode
 *  name: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_VariantOptionComp
 */

/**
 * @param {Product_VariantOptionComp} comp
 * @param {*} parent
 * @param {Product_VariantOptionCompData} data
 */
function product_variantOptionComp(
	comp,
	parent,
	data = {
		product_variant_option_id: -1,
		product_variant_id: -1,
		name: "",
		product_feature_options: [],
		features: [],
	}
) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				let options_html = html`<option value="0">―</option>`;
				if (data.features) {
					data.features.forEach((feature) => {
						const fea = product_features.find((f) => f.product_feature_id === feature.product_feature_id);
						options_html += feature.options
							.filter((op) => !data.product_feature_options.includes(op.product_feature_option_id))
							.map((option) => {
								return html`<option value="${option.product_feature_option_id}">${fea.name}: ${option.value}</option>`;
							});
					});

					const selected_options_html = html`${data.product_feature_options
						.map((option_id) => {
							const option = product_feature_options.find((op) => op.product_feature_option_id === option_id);
							if (option) {
								const fea = product_features.find((f) => f.product_feature_id === option.product_feature_id);
								return html`
									<span class="semi_bold">${fea.name}:</span>
									<span style="margin-left: 5px">${option.value}</span>
									<button class="btn transparent small remove_option" data-option_id="${option_id}" style="margin-left: 2px">
										<i class="fas fa-times"></i>
									</button>
								`;
							}
							return "";
						})
						.join("<br>")}`;

					comp._nodes.select_options._set_content(options_html);
					comp._nodes.selected_options._set_content(selected_options_html);
				}

				if (comp._changed_data.name) {
					setTimeout(() => {
						autoHeight(comp._nodes.name);
					});
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<span class="semi_bold mr2" html="{${"Wariant " + (data.row_index + 1) + "."}}"></span>
			<textarea
				class="field small inline hide_scrollbar"
				data-bind="{${data.name}}"
				data-node="{${comp._nodes.name}}"
				data-input_delay="200"
				data-tooltip="Wpisz nazwę wariantu, np. Czerwony"
			></textarea>

			<div style="margin: 0 10px">
				<div class="select_options_wrapper" style="width: 80px;">
					<select class="field small" data-node="{${comp._nodes.select_options}}"></select>
					<button class="btn primary small">Cechy <i class="fas fa-plus"></i></button>
				</div>
			</div>
			<div data-node="{${comp._nodes.selected_options}}"></div>

			<div style="margin-left:auto">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>
		`,
		initialize: () => {
			comp._nodes.name.addEventListener("input", () => {
				autoHeight(comp._nodes.name);
			});

			$(".main_admin_scroll").addEventListener(
				"scroll",
				() => {
					autoHeight(comp._nodes.name);
				},
				{ once: true }
			);

			const so = comp._nodes.select_options;
			so.addEventListener("change", () => {
				const option_id = +so._get_value();
				if (option_id) {
					comp._data.product_feature_options.push(option_id);
					comp._render();
				}
			});

			comp.addEventListener("click", (ev) => {
				const target = $(ev.target);

				if (!target) {
					return;
				}

				const remove_option = target._parent(".remove_option");
				if (remove_option) {
					const ind = comp._data.product_feature_options.indexOf(+remove_option.dataset.option_id);
					if (ind !== -1) {
						comp._data.product_feature_options.splice(ind, 1);
					}
					comp._render();
				}
			});
		},
	});
}
