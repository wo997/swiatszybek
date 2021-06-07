/* js[admin] */

/**
 * @typedef {{
 * product_img_id
 * img_url: string
 * selected_product_feature_options: number[]
 * features?: Product_FeatureCompData[]
 * } & ListCompRowData} Product_ImgCompData
 *
 * @typedef {{
 * _data: Product_ImgCompData
 * _set_data(data?: Product_ImgCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  feature_name: PiepNode
 *  edit_Image_btn: PiepNode
 *  add_option_btn: PiepNode
 *  select_options: PiepNode
 *  selected_options: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_ImgComp
 */

/**
 * @param {Product_ImgComp} comp
 * @param {*} parent
 * @param {Product_ImgCompData} data
 */
function Product_ImgComp(comp, parent, data = { product_img_id: -1, img_url: "", selected_product_feature_options: [] }) {
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
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
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<image-picker data-bind="{${data.img_url}}" style="width:120px;height:120px"></image-picker>

			<div data-node="{${comp._nodes.selected_options}}"></div>

			<div style="margin-left:auto;flex-shrink: 0;">
				<div class="select_options_wrapper" data-tooltip="Powiąż zdjęcie z cechami, by klient zobaczył dokładnie to czego szuka">
					<select class="field small blank" data-node="{${comp._nodes.select_options}}"></select>
					<button class="btn primary small"><i class="fas fa-plus"></i></button>
				</div>
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>
		`,
		initialize: () => {
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
