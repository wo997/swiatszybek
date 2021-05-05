/* js[admin] */

/**
 * @typedef {{
 * product_variant_option_id: number
 * product_variant_id: number
 * name: string
 * pos?: number
 * selected_product_feature_options: number[]
 * product_feature_option_ids?: number[]
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
function Product_VariantOptionComp(
	comp,
	parent,
	data = {
		product_variant_option_id: -1,
		product_variant_id: -1,
		name: "",
		selected_product_feature_options: [],
		features: [],
	}
) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				if (data.features) {
					let options_html = html`<option value="0">―</option>`;
					const product_feature_option_ids = data.features.map((pf) => pf.options.map((opt) => opt.product_feature_option_id)).flat(1);
					product_feature_options
						.filter(
							(pfo) =>
								product_feature_option_ids.includes(pfo.product_feature_option_id) &&
								!data.selected_product_feature_options.includes(pfo.product_feature_option_id)
						)

						.forEach((pfo) => {
							const pf = product_features.find((pf) => pf.product_feature_id === pfo.product_feature_id);
							if (pf) {
								options_html += html`<option value="${pfo.product_feature_option_id}">${pf.name}: ${pfo.value}</option>`;
							}
						});

					const selected_options_html = html`${data.selected_product_feature_options
						.map((option_id) => {
							const pfo = product_feature_options.find((pfo) => pfo.product_feature_option_id === option_id);
							if (pfo) {
								const pf = product_features.find((pf) => pf.product_feature_id === pfo.product_feature_id);
								if (pf) {
									return html`
										<span class="semi_bold">${pf.name}:</span>
										<span style="margin-left: 5px">${pfo.value}</span>
										<button class="btn transparent small remove_option" data-option_id="${option_id}" style="margin-left: 2px">
											<i class="fas fa-times"></i>
										</button>
									`;
								}
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
			<textarea
				class="field small inline hide_scrollbar"
				data-bind="{${data.name}}"
				data-node="{${comp._nodes.name}}"
				data-input_delay="200"
				data-tooltip="Wpisz nazwę wariantu, np. Czerwony"
			></textarea>

			<div data-node="{${comp._nodes.selected_options}}"></div>

			<div style="margin-left:auto;flex-shrink: 0;">
				<div
					class="select_options_wrapper"
					data-tooltip="Powiąż wariant z cechami, by umożliwić klientom dokładniejsze wyszukiwanie produktów"
				>
					<select class="field small blank" data-node="{${comp._nodes.select_options}}"></select>
					<button class="btn primary small"><i class="fas fa-plus"></i></button>
				</div>
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
					comp._data.selected_product_feature_options.push(option_id);
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
					const ind = comp._data.selected_product_feature_options.indexOf(+remove_option.dataset.option_id);
					if (ind !== -1) {
						comp._data.selected_product_feature_options.splice(ind, 1);
					}
					comp._render();
				}
			});
		},
	});
}
